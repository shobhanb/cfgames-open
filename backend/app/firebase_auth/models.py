from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class FirebaseUser(Base):
    email: Mapped[str] = mapped_column(String, unique=True)
    uid: Mapped[str] = mapped_column(String, unique=True)
    crossfit_id: Mapped[int] = mapped_column(Integer, unique=True)
    affiliate_id: Mapped[int] = mapped_column(Integer)
    affiliate_name: Mapped[str] = mapped_column(String)
