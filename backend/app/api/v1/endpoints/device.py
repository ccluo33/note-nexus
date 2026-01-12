from fastapi import APIRouter
import uuid

router = APIRouter()

@router.get("/id", summary="获取设备 ID", description="生成或获取唯一的设备标识符")
def get_device_id():
    """获取设备 ID
    
    生成一个唯一的设备标识符，用于设备识别和跟踪。
    
    Returns:
        str: 唯一的设备 ID
    """
    # 在实际应用中，可能需要从数据库或其他持久化存储中获取设备 ID
    # 这里简单生成一个 UUID
    device_id = str(uuid.uuid4())
    return device_id
