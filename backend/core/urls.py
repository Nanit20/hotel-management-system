from django.urls import path
from .views import login, inventario_list_create, inventario_detail

urlpatterns = [
    path("login/", login),
    path("inventario/", inventario_list_create),
    path("inventario/<int:item_id>/", inventario_detail),
]
