import json
import redis

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=False
)

def get_cached(key):
    try:
        cached_data = redis_client.get(key)

        if cached_data is None:
            return None

        json_string = cached_data.decode('utf-8')
        python_object = json.loads(json_string)

        return python_object

    except Exception:
        return None

def set_cached(key, data, expire_seconds=300):
    try:
        json_string = json.dumps(data)
        redis_client.setex(key, expire_seconds, json_string)

    except Exception:
        pass

def delete_cached(key):
    try:
        redis_client.delete(key)
    except Exception:
        pass

def clear_all_cache():
    try:
        redis_client.flushdb()
    except Exception:
        pass