from django.shortcuts import render, redirect

from django.http import HttpResponse, JsonResponse , FileResponse
from django import forms
from .forms import ingredientList
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PIL import Image, ImageDraw, ImageFont
import groq
# from mysite.settings import LOADENV
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
import re
import io

from .models import Ingredient
# Create your views here.

load_dotenv()

def index(request):
    if request.method == "POST":
        ingredients_input = request.POST.get("final_ingredients", "")
        selected_options = [i.strip() for i in ingredients_input.split(",") if i.strip()]

        print(f"[POST] Final selected ingredients with quantities: {selected_options}")

        ai_response = feedLLM(selected_options)


        request.session['selected_options'] = selected_options
        request.session['ai_response'] = ai_response

        return redirect('response_recipe')

    return render(request, 'index.html') 

#displays a new page with the recipe listed
def response_recipe(request):
    selected_options = request.session.get('selected_options', [])
    ai_response = request.session.get('ai_response', "")

    return render(request, 'recipetemp.html', {'selected_options': selected_options, 'ai_response': ai_response})


def feedLLM(selected_options):
    
    llm = ChatGroq(temperature=0, api_key=os.getenv("GROQ_API_KEY"), model_name="llama-3.3-70b-versatile")


       # Create the prompt
    prompt = f"""I want a recipe that I can make for the list of ingredients and quantity. It is fine even if it simple. The recipe should be accurate with the list of ingredients and their quantity. For now you can assume that the user has the required quantity. The recipe should have a title, cuisine, 
    and amount of time required to cook the recipe, the list of ingredients with their quantity, utensils required and then a step by step process of cooking the recipe. Be careful to not suggest a recipe with ingredients that the user has not mentioned, 
    and one that does not exist. Do not assume that the user has more ingredients. YOU DO NOT NEED TO USE ALL THE INGREDIENTS LISTED.

    Please format your recipe response like this:

    Title: <recipe title>  
    Cuisine: <cuisine type>  
    Time Required: <cook time>  
    Ingredients:
    - ...
    Utensils:
    - ...
    Steps:
    1. ...
    2. ...
    Here is the list of ingredients with the quantity: {selected_options}"""

    # Invoke the model with the prompt
    response = llm.invoke(prompt)
    # Directly access the content attribute
    # If there's a proxy, you may need to resolve it or use another method to extract data
    raw = response.content if hasattr(response, 'content') else response.resolve()
    print(raw)

    # Using regex to extract specific parts of the response
    sections = {
        "title": re.search(r"(?:Title:|Recipe:)\s*(.+)", raw, re.IGNORECASE),
        "cuisine": re.search(r"Cuisine:\s*(.+)", raw, re.IGNORECASE),
        "time": re.search(r"Time(?: Required)?:\s*(.+)", raw, re.IGNORECASE),
        "ingredients": re.search(r"Ingredients:\s*((?:.|\n)+?)\n(?:Utensils:|Steps:)", raw, re.IGNORECASE),
        "utensils": re.search(r"Utensils:\s*((?:.|\n)+?)\n(?:Steps:)", raw, re.IGNORECASE),
        "steps": re.search(r"Steps:\s*((?:.|\n)+)", raw, re.IGNORECASE),
    }

    # Cleans up lists from repetivenes
    def clean_section_list(section):
        return [
            re.sub(r"^\s*[\d]+[.)]\s*", "", item.strip(" \n\r-•").strip())
            for item in section
            if item.strip() and not item.lower().startswith("ingredients:")
        ]

    # Dictionary from the regex matches in `sections`
    parsed = {
        key: (
            # Send list-based sections through clean_section_list() otherwise just return the string directly
            clean_section_list(match.group(1).strip().split("\n"))
            if key in ["ingredients", "utensils", "steps"]
            else match.group(1).strip()
        )
        for key, match in sections.items() if match # Loop to go through all the sections
    }

    # # Return the full content of the response
    # return response.content
    return parsed



# Function to generate and download PDF
def download_pdf(request):
    ai_response = request.session.get('ai_response', "")

    if not ai_response:
        return redirect('response_recipe')

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.setFont("Times-Roman", 12)  # Set font to Times New Roman

    y_position = 750  # Start position for text

    for key, value in ai_response.items():
        if y_position < 50:  # Create a new page if necessary
            pdf.showPage()
            pdf.setFont("Times-Roman", 12)
            y_position = 750

        pdf.drawString(50, y_position, f"{key.capitalize()}:")
        y_position -= 20  # Move down after the key

        if isinstance(value, list):
            for item in value:
                pdf.drawString(70, y_position, f"- {item}")  # Indent list items
                y_position -= 15  # Move down for each item
        else:
            pdf.drawString(70, y_position, value)
            y_position -= 20  # Move down for the next section

    pdf.save()
    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename="recipe.pdf")


# Function to generate and download JPG
def download_jpg(request):
    ai_response = request.session.get('ai_response', "")

    if not ai_response:
        return redirect('response_recipe')  # Redirect if no data

    img = Image.new("RGB", (800, 800), "white")
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("arial.ttf", 20)  # Use Arial if available
    except:
        font = ImageFont.load_default()

    y_position = 50
    line_spacing = 25  # Adjust line spacing for better readability

    for key, value in ai_response.items():
        if y_position > 550:  # Ensure text fits within image bounds
            break  # You may need to create a new image if content is too long

        draw.text((50, y_position), f"{key.capitalize()}:", fill="black", font=font)
        y_position += 30  # Move down after the key

        if isinstance(value, list):
            for item in value:
                draw.text((70, y_position), f"- {item}", fill="black", font=font)  # Indent list items
                y_position += line_spacing  # Move down for each list item
        else:
            draw.text((70, y_position), value, fill="black", font=font)
            y_position += line_spacing  # Move down for the next section

    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    buffer.seek(0)
    
    return FileResponse(buffer, as_attachment=True, filename="recipe.jpg")

def search_ingredients(request):
    # Gets the search query
    query = request.GET.get('q', '').strip().lower()
    # Query the database for ingredients whose name starts with the input
    if query:
        results = Ingredient.objects.filter(ingredient_name__istartswith=query).values_list('ingredient_name', flat=True)
        return JsonResponse({'results': list(results)}) # Sends back the matching ingredient names as JSON
    return JsonResponse({'results': []})

