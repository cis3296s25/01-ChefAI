from django.shortcuts import render, redirect
from django.http import HttpResponse
from django import forms
from .forms import ingredientList
from django.conf import settings
import groq
# from mysite.settings import LOADENV
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
# Create your views here.

load_dotenv()

def index(request):
    if request.method == "POST":
        form = ingredientList(request.POST)
        if form.is_valid():
            selected_options = form.cleaned_data['choices']
            
            ai_response = feedLLM(selected_options)

            return render(request, 'resp.html', {'selected_options': selected_options, 'ai_response' : ai_response})
    else:
        form = ingredientList()
    return render(request, 'test.html', {'form': form})


def feedLLM(selected_options):
    
    llm = ChatGroq(temperature=0, api_key=os.getenv("GROQ_API_KEY"), model_name="llama-3.3-70b-versatile")


       # Create the prompt
    prompt = f"""I want the most optimal and real recipe that I can make for the list of ingredients and quantity. The recipe should be accurate with the list of ingredients and their quantity. If additional ingredients are required, ask the user if they have it with them, if they do not, then don’t create a fake recipe, instead be honest and say that you will not be able to make a recipe with the given ingredients based on your knowledge. The recipe should have a title, cuisine, and amount of time required to cook the recipe, the list of ingredients with their quantity, utensils required and then a step by step process of cooking the recipe. Be careful to not suggest a recipe with ingredients that the user has not mentioned, and one that does not exist. If it is not possible then mention it to the user. Here is the list of ingredients with the quantity: {selected_options}"""

    # Invoke the model with the prompt
    response = llm.invoke(prompt)
    if hasattr(response, 'content'):
        return response.content  # Directly access the content attribute
    else:
        # If there's a proxy, you may need to resolve it or use another method to extract data
        return response.resolve()

    # # Return the full content of the response
    # return response.content