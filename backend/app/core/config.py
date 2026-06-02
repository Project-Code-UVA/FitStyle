from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

#Pydantic BaseSettings already reads from environment variables into class attributes
#extra ensures other vars in .env file are ignored

class Settings(BaseSettings):

    model_config = SettingsConfigDict(env_file = ".env", extra = "ignore")

    supabase_url: str
    supabase_publishable_key: str

    app_env: str = "development"
    #frontend urls
    allowed_origins: list[str]=["http://localhost:3000", "http://172.26.40.195:3000"]
    

    #checks if the app is running in production environment
    @property
    def is_production(self) -> bool:
        return self.app_env == "production"
    
@lru_cache()
def get_settings():
    return Settings()