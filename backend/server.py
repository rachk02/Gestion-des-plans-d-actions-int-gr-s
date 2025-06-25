from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
import mimetypes
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from dotenv import load_dotenv
import shutil
from pathlib import Path
import io
import json
import zipfile

load_dotenv()

app = FastAPI(title="Nextcloud Clone API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/nextcloud_clone")
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")

# Database
client = AsyncIOMotorClient(MONGO_URL)
db = client.nextcloud_clone

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool = True
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class FileInfo(BaseModel):
    id: str
    name: str
    path: str
    size: int
    type: str
    mime_type: Optional[str] = None
    extension: Optional[str] = None
    created_at: datetime
    modified_at: datetime
    owner_id: str
    is_shared: bool = False
    can_preview: bool = False

class FileOperation(BaseModel):
    source_path: str
    destination_path: str

class FolderCreate(BaseModel):
    path: str
    name: str

class FileRename(BaseModel):
    path: str
    new_name: str

class SearchRequest(BaseModel):
    query: str
    path: str = ""
    file_type: Optional[str] = None

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_file_type(file_path: Path):
    """Get file type and determine if it can be previewed"""
    suffix = file_path.suffix.lower()
    mime_type, _ = mimetypes.guess_type(str(file_path))
    
    # Image files
    if suffix in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']:
        return 'image', mime_type, True
    
    # Text files
    elif suffix in ['.txt', '.md', '.json', '.xml', '.html', '.css', '.js', '.py', '.java', '.cpp', '.c']:
        return 'text', mime_type or 'text/plain', True
    
    # Document files
    elif suffix in ['.pdf']:
        return 'document', mime_type, True
    
    # Video files
    elif suffix in ['.mp4', '.avi', '.mov', '.mkv', '.webm']:
        return 'video', mime_type, True
        
    # Audio files
    elif suffix in ['.mp3', '.wav', '.ogg', '.flac']:
        return 'audio', mime_type, True
        
    # Archive files
    elif suffix in ['.zip', '.rar', '.tar', '.gz', '.7z']:
        return 'archive', mime_type, False
        
    else:
        return 'file', mime_type or 'application/octet-stream', False

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.get("/api")
async def root():
    return {"message": "Nextcloud Clone API"}

@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user)
    
    # Create user folder
    user_folder = Path(UPLOAD_FOLDER) / user_id
    user_folder.mkdir(parents=True, exist_ok=True)
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return User(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"]
    )

@app.get("/api/files")
async def get_files(
    path: str = "", 
    search: str = "",
    sort_by: str = "name",
    sort_order: str = "asc",
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    target_path = user_folder / path.lstrip("/")
    
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    
    files = []
    
    # Get all files in directory
    for item in target_path.iterdir():
        # Skip hidden files
        if item.name.startswith('.'):
            continue
            
        stat = item.stat()
        file_type, mime_type, can_preview = get_file_type(item)
        
        # Apply search filter
        if search and search.lower() not in item.name.lower():
            continue
            
        files.append({
            "id": str(uuid.uuid4()),
            "name": item.name,
            "path": str(item.relative_to(user_folder)),
            "size": stat.st_size,
            "type": "folder" if item.is_dir() else file_type,
            "mime_type": mime_type if not item.is_dir() else None,
            "extension": item.suffix.lower() if not item.is_dir() else None,
            "created_at": datetime.fromtimestamp(stat.st_ctime),
            "modified_at": datetime.fromtimestamp(stat.st_mtime),
            "owner_id": current_user["id"],
            "is_shared": False,
            "can_preview": can_preview and not item.is_dir()
        })
    
    # Sort files
    reverse = sort_order == "desc"
    if sort_by == "name":
        files.sort(key=lambda x: x["name"].lower(), reverse=reverse)
    elif sort_by == "size":
        files.sort(key=lambda x: x["size"], reverse=reverse)
    elif sort_by == "modified":
        files.sort(key=lambda x: x["modified_at"], reverse=reverse)
    elif sort_by == "type":
        files.sort(key=lambda x: (x["type"], x["name"].lower()), reverse=reverse)
    
    # Folders first
    folders = [f for f in files if f["type"] == "folder"]
    files_only = [f for f in files if f["type"] != "folder"]
    
    return {
        "files": folders + files_only, 
        "path": path,
        "total_files": len(files_only),
        "total_folders": len(folders)
    }

@app.post("/api/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    path: str = "",
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    target_path = user_folder / path.lstrip("/")
    target_path.mkdir(parents=True, exist_ok=True)
    
    file_path = target_path / file.filename
    
    # Check if file already exists
    if file_path.exists():
        # Create unique filename
        stem = file_path.stem
        suffix = file_path.suffix
        counter = 1
        while file_path.exists():
            file_path = target_path / f"{stem}_{counter}{suffix}"
            counter += 1
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"message": "File uploaded successfully", "filename": file_path.name}

@app.get("/api/files/download")
async def download_file(
    path: str,
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    file_path = user_folder / path.lstrip("/")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    if file_path.is_dir():
        # Create zip for folder download
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for file in file_path.rglob('*'):
                if file.is_file():
                    zip_file.write(file, file.relative_to(file_path))
        
        zip_buffer.seek(0)
        return StreamingResponse(
            io.BytesIO(zip_buffer.read()),
            media_type='application/zip',
            headers={"Content-Disposition": f"attachment; filename={file_path.name}.zip"}
        )
    else:
        return FileResponse(
            path=file_path,
            filename=file_path.name,
            media_type='application/octet-stream'
        )

@app.get("/api/files/preview")
async def preview_file(
    path: str,
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    file_path = user_folder / path.lstrip("/")
    
    if not file_path.exists() or file_path.is_dir():
        raise HTTPException(status_code=404, detail="File not found")
    
    file_type, mime_type, can_preview = get_file_type(file_path)
    
    if not can_preview:
        raise HTTPException(status_code=400, detail="File cannot be previewed")
    
    if file_type == 'text':
        # Read text file content
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {"type": "text", "content": content, "mime_type": mime_type}
        except UnicodeDecodeError:
            return {"type": "binary", "message": "Binary file cannot be previewed as text"}
    
    elif file_type == 'image':
        return FileResponse(file_path, media_type=mime_type)
    
    else:
        return FileResponse(file_path, media_type=mime_type)

@app.post("/api/files/folder")
async def create_folder(
    folder_data: FolderCreate,
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    target_path = user_folder / folder_data.path.lstrip("/")
    new_folder = target_path / folder_data.name
    
    if new_folder.exists():
        raise HTTPException(status_code=400, detail="Folder already exists")
    
    new_folder.mkdir(parents=True, exist_ok=True)
    return {"message": "Folder created successfully", "name": folder_data.name}

@app.put("/api/files/rename")
async def rename_file(
    rename_data: FileRename,
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    old_path = user_folder / rename_data.path.lstrip("/")
    new_path = old_path.parent / rename_data.new_name
    
    if not old_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    if new_path.exists():
        raise HTTPException(status_code=400, detail="A file with this name already exists")
    
    old_path.rename(new_path)
    return {"message": "File renamed successfully", "new_name": rename_data.new_name}

@app.put("/api/files/move")
async def move_file(
    move_data: FileOperation,
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    source_path = user_folder / move_data.source_path.lstrip("/")
    dest_path = user_folder / move_data.destination_path.lstrip("/")
    
    if not source_path.exists():
        raise HTTPException(status_code=404, detail="Source file not found")
    
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    
    if dest_path.exists():
        raise HTTPException(status_code=400, detail="Destination already exists")
    
    shutil.move(str(source_path), str(dest_path))
    return {"message": "File moved successfully"}

@app.post("/api/files/copy")
async def copy_file(
    copy_data: FileOperation,
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    source_path = user_folder / copy_data.source_path.lstrip("/")
    dest_path = user_folder / copy_data.destination_path.lstrip("/")
    
    if not source_path.exists():
        raise HTTPException(status_code=404, detail="Source file not found")
    
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    
    if dest_path.exists():
        raise HTTPException(status_code=400, detail="Destination already exists")
    
    if source_path.is_dir():
        shutil.copytree(str(source_path), str(dest_path))
    else:
        shutil.copy2(str(source_path), str(dest_path))
    
    return {"message": "File copied successfully"}

@app.delete("/api/files")
async def delete_file(
    path: str,
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    file_path = user_folder / path.lstrip("/")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    if file_path.is_dir():
        shutil.rmtree(file_path)
    else:
        file_path.unlink()
    
    return {"message": "File deleted successfully"}

@app.post("/api/files/search")
async def search_files(
    search_data: SearchRequest,
    current_user: dict = Depends(get_current_user)
):
    user_folder = Path(UPLOAD_FOLDER) / current_user["id"]
    search_path = user_folder / search_data.path.lstrip("/")
    
    if not search_path.exists():
        raise HTTPException(status_code=404, detail="Search path not found")
    
    results = []
    query = search_data.query.lower()
    
    # Recursive search
    for item in search_path.rglob('*'):
        if item.is_file() or item.is_dir():
            # Check if filename matches query
            if query in item.name.lower():
                # Check file type filter
                if search_data.file_type:
                    if item.is_dir() and search_data.file_type != "folder":
                        continue
                    if item.is_file():
                        file_type, _, _ = get_file_type(item)
                        if file_type != search_data.file_type:
                            continue
                
                stat = item.stat()
                file_type, mime_type, can_preview = get_file_type(item)
                
                results.append({
                    "id": str(uuid.uuid4()),
                    "name": item.name,
                    "path": str(item.relative_to(user_folder)),
                    "size": stat.st_size,
                    "type": "folder" if item.is_dir() else file_type,
                    "mime_type": mime_type if not item.is_dir() else None,
                    "extension": item.suffix.lower() if not item.is_dir() else None,
                    "created_at": datetime.fromtimestamp(stat.st_ctime),
                    "modified_at": datetime.fromtimestamp(stat.st_mtime),
                    "owner_id": current_user["id"],
                    "can_preview": can_preview and not item.is_dir()
                })
    
    # Sort by relevance (exact matches first, then partial matches)
    results.sort(key=lambda x: (
        0 if query == x["name"].lower() else 1,
        x["name"].lower()
    ))
    
    return {"results": results, "total": len(results), "query": search_data.query}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)