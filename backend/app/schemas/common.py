import json
from decimal import Decimal
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, field_validator


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    @field_validator("servicios", mode="before", check_fields=False)
    @classmethod
    def parse_servicios(cls, v: Any) -> Any:
        if v is None:
            return []
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
                return []
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    @field_validator("*", mode="before", check_fields=False)
    @classmethod
    def parse_decimal(cls, v: Any) -> Any:
        if isinstance(v, Decimal):
            return float(v)
        return v
