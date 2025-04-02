from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("test/", views.index, name="test"),
    path("recipe/", views.response_recipe, name="response_recipe"),
    path("download-pdf/", views.download_pdf, name = 'download_pdf'),
    path("download-jpg/", views.download_jpg, name='download_jpg')
    path("search/", views.search_ingredients, name="search_ingredients"),


]