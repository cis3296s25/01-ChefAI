let i = 0;
let placeholder = "";
const txt = "Search ingredients...";
const speed = 300;

function type() {
    placeholder += txt.charAt(i);
    document.getElementById('searchInput').setAttribute("placeholder", placeholder);
    i++;
    setTimeout(type, speed);
}

type();



let plusButton = document.getElementById("increment_recipes");
let minusButton = document.getElementById("decrement_recipes");
let numRecipesDisplay = document.getElementById("recipe_amount");
let maxNumRecipe=5;
let minNumRecipe=1;

//resets num recipes to zero unless redirected from another page(aka the hyperlink on the results page)
if (
    document.referrer === "" ||                  // direct reload
    new URL(document.referrer).pathname === window.location.pathname // same page navigation
) {
    numRecipesDisplay.value = 1;
}

plusButton.addEventListener("click", () =>{
    numRecipesDisplay.value =Math.min(Number(numRecipesDisplay.value)+1, maxNumRecipe); 

});
minusButton.addEventListener("click", () =>{
    numRecipesDisplay.value = Math.max(minNumRecipe, Number(numRecipesDisplay.value)-1);
});


//values exist for form validation in case we allow the user to manually type in the box
//Also limits the value
numRecipesDisplay.addEventListener("change", () =>{

    if(Number(numRecipesDisplay.value) > maxNumRecipe){
        numRecipesDisplay.value = maxNumRecipe;
    }
    else if(Number(numRecipesDisplay.vlaue) < minNumRecipe){
        numRecipesDisplay.value = minNumRecipe;
    }
    else if(isNaN(numRecipesDisplay.value)){
        numRecipesDisplay.value = minNumRecipe;
    }
})
let clearItems = document.getElementById("clr-btn");


const ingredientCategories = {
    pantryEssentials: [
        'Rice', 'Pasta', 'Flour', 'Sugar',
        'Salt', 'Olive Oil', 'Vinegar',
        'Bread', 'Cereal'
    ],
    spices: [
        'Black Pepper', 'Paprika', 'Cumin',
        'Oregano', 'Garlic Powder', 'Cinnamon',
        'Turmeric', 'Chili Powder', 'Basil'
    ],
    vegetablesGreens: [
        'Onions', 'Tomatoes', 'Spinach',
        'Carrots', 'Broccoli', 'Lettuce',
        'Potato', 'Bell Pepper', 'Cucumber'
    ]
};

function createCategoryItems() {
    Object.keys(ingredientCategories).forEach(categoryKey => {
        const categoryContainer = document.querySelector(`#${categoryKey} .category-items`);

        if (!categoryContainer) return; // Prevent errors if container is missing

        ingredientCategories[categoryKey].forEach(item => {
            const itemWrapper = document.createElement('div');
            itemWrapper.classList.add('category-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${categoryKey}-${item.toLowerCase().replace(/\s+/g, '-')}`;
            checkbox.name = item;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = item;

            itemWrapper.appendChild(checkbox);
            itemWrapper.appendChild(label);

            categoryContainer.appendChild(itemWrapper);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // For tracking highlighted sugguestions
    let selectedIndex = -1; 
    let suggestions = [];
    
    const letsCook = document.getElementById('letsCook');
    const searchInput = document.getElementById('searchInput');
    const selectedItemsContainer = document.getElementById('selectedItemsContainer');
    const selectedItemsDiv = document.getElementById('selectedItems');
    const form = document.querySelector("form");



    form.addEventListener("submit", (e) => {
        if (document.activeElement === searchInput) {
            e.preventDefault(); // Block submission if user is typing and hits enter in the search bar
        }
    });

    createCategoryItems(); // Generate ingredient checkboxes


    // Search and select ingredients
    const suggestionBox = document.getElementById("searchSuggestions");
    searchInput.addEventListener('keyup', async (event) => {
        if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) return;

        const query = searchInput.value.trim(); // Grabs the user's input and remove any extra spaces
        // Ignores unneccessary inputs
        if (query.length < 2) {
            suggestionBox.style.display = "none";
            return;
        }

        // Sends a request to the backend
        try {
            const response = await fetch(`/search/?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            suggestionBox.innerHTML = '';
            selectedIndex = -1;
            suggestions = [];


            if (data.results.length > 0) {
                data.results.forEach(result => {
                    const suggestion = document.createElement("div"); // To make each match as a clickable div
                    suggestion.textContent = result;
                    suggestion.classList.add("suggestion-ingredient");

                    //adds button to selected ingredients
                    suggestion.addEventListener("click", () => {
                        let matched = false;
                        Object.keys(ingredientCategories).forEach(categoryKey => { // Trys to match with predefined ingredientCategories
                            ingredientCategories[categoryKey].forEach(item => {
                                //First checks if item exists in the predefines list of ingredients
                                // Selects the checkbox and adds to UI
                                if (item.toLowerCase() === result.toLowerCase()) {
                                    const checkboxId = `${categoryKey}-${item.toLowerCase().replace(/\s+/g, '-')}`;
                                    const checkbox = document.getElementById(checkboxId);
                                    if (checkbox && !checkbox.checked) {
                                        checkbox.checked = true;
                                        addSelectedItem(item, categoryKey);
                                        matched = true;
                                    }
                                }
                                // else {
                                //     //add item since it exists in db
                                //     addSelectedItem(data.results[0], data.results[0]);
                                // }
                            });
                        });
                        // Treats non-matches in the ingredientCategories as a valid DB result
                        if (!matched) {
                            addSelectedItem(result, "db");
                        }

                        // Clears input and hides dropdown after user clicks a suggestion
                        searchInput.value = '';
                        suggestionBox.innerHTML = '';
                        suggestionBox.style.display = "none";
                    });
                    suggestionBox.appendChild(suggestion);
                    suggestions.push(suggestion); // Stores suggestion for keyboard use
                });
                suggestionBox.style.display = "block";
            } else {
                suggestionBox.style.display = "none";
            }
        } catch (err) {
            console.error("Search error:", err);
            suggestionBox.style.display = "none";
        }
    });

    // Handles uploaded image file display
    const imageInput = document.getElementById("image-upload-input");
    const uploadedImagesContainer = document.getElementById("uploadedImagesContainer");
    const uploadedFilesList = document.getElementById("uploadedFilesList");

    // Tracks selected image files in memory
    let selectedImages = [];

    imageInput.addEventListener("change", function (event) {
        const newFiles = Array.from(event.target.files);
      
        newFiles.forEach(file => {
          const duplicate = selectedImages.some(existing => existing.name === file.name && existing.size === file.size);
          if (!duplicate) {
            selectedImages.push({ file, selected: true });
          }
        });
      
        refreshImageListDisplay();
      
        // Resets input so user can re-upload same file again if needed
        imageInput.value = "";
    });

    function refreshImageListDisplay() {
    uploadedFilesList.innerHTML = "";

    if (selectedImages.length === 0) {
        uploadedImagesContainer.style.display = "none";
        return;
    }

    uploadedImagesContainer.style.display = "block";
    
    selectedImages.forEach((item, index) => {
        const container = document.createElement("div");
        container.className = "uploaded-file-item";
    
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.selected ?? true;
        checkbox.addEventListener("change", () => {
          selectedImages[index].selected = checkbox.checked;
        });
    
        const fileNameSpan = document.createElement("span");
        fileNameSpan.textContent = item.file?.name || item.name || "Unnamed";
        fileNameSpan.style.marginLeft = "0.5rem";
    
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "uploaded-file-remove";
        deleteBtn.innerHTML = "❌";
        deleteBtn.addEventListener("click", () => {
          selectedImages.splice(index, 1);
          refreshImageListDisplay();
        });
    
        container.appendChild(checkbox);
        container.appendChild(fileNameSpan);
        container.appendChild(deleteBtn);
        uploadedFilesList.appendChild(container);
    });
    
    uploadedFilesList.scrollTop = uploadedFilesList.scrollHeight;
    }

    //Script that scans images for ingredients
    document.getElementById('scan-btn').addEventListener('click', () => {
        const scanBtn = document.getElementById('scan-btn');
        scanBtn.textContent = "Scanning...";
        scanBtn.disabled = true;

        const formData = new FormData();
        selectedImages
            .filter(item => item.selected)
            .forEach(item => {
                formData.append('images', item.file);
            });
    
        fetch('/scan-images/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Scan failed (${response.status}): ${errorText}`);
            }
            return response.json();
        })
        .then(data => {
            const ingredients = data.ingredients;
            const categoryKey = 'detected'; // Or however you want to categorize
            
            console.log("Scan returned:", data);
            if (!Array.isArray(ingredients)) {
                alert("No ingredients detected.");
                return;
            }

            ingredients.forEach(item => {
                addSelectedItem(item, categoryKey);
            });
        })
        .catch(error => {
            console.error('Scan error:', error);
            alert("Scan failed");
        })
        .finally(() => {
            scanBtn.textContent = "Scan Image";
            scanBtn.disabled = false;
        });
    });

    // Highlights the currently selected suggestion based on selectedIndex
    function updateHighlight() {
        suggestions.forEach((s, index) => {
            if (index === selectedIndex) {
                s.classList.add("highlighted");
                s.scrollIntoView({ block: "nearest", behavior: "smooth" });
            } else {
                s.classList.remove("highlighted");
            }
        })
    }

    searchInput.addEventListener("keydown", (event) => {
        if (suggestionBox.style.display === "none") return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            selectedIndex = (selectedIndex + 1) % suggestions.length; // Loops to first after last
            updateHighlight();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length; // Loops to last from first
            updateHighlight();
        } else if (event.key === "Enter") {
            event.preventDefault();
            const inputValue = searchInput.value.trim();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                suggestions[selectedIndex].click(); // Triggers click on highlighted suggestion
            }else if(inputValue.length>=2){
                let matched = false;
                Object.keys(ingredientCategories).forEach(categoryKey => {
                    ingredientCategories[categoryKey].forEach(item => {
                        if (item.toLowerCase() === inputValue.toLowerCase()) {
                            const checkboxId = `${categoryKey}-${item.toLowerCase().replace(/\s+/g, '-')}`;
                            const checkbox = document.getElementById(checkboxId);
                            if (checkbox && !checkbox.checked) {
                                checkbox.checked = true;
                                addSelectedItem(item, categoryKey);
                                matched = true;
                            }
                        }
                    });
                    // If not matched, assume it's a valid DB result and add it
                    if (!matched) {
                        addSelectedItem(inputValue, 'db');
                    }

                    // Clear input and hide suggestion box
                    searchInput.value = '';
                    suggestionBox.innerHTML = '';
                    suggestionBox.style.display = 'none';
                })
            }
        }  
    })

    // Hides the dropdown if user clicks anywhere on the page
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.style.display = "none";
        }
    });

    //allows the entire ingredient div to be clickable
    document.querySelectorAll('.category-item').forEach(categoryItem => {
        categoryItem.addEventListener('click', (e) => {
            // Prevent default label behavior
            e.preventDefault();
    
            const checkbox = categoryItem.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
    
            // Toggle checkbox manually
            checkbox.checked = !checkbox.checked;
    
            const item = checkbox.name;
            const categoryKey = checkbox.id.split('-')[0];
            const selectedId = `selected-${item.toLowerCase().replace(/\s+/g, '-')}`;
            const alreadyAdded = document.getElementById(selectedId);
    
            if (checkbox.checked && !alreadyAdded) {
                addSelectedItem(item, categoryKey);
                categoryItem.classList.add("selected");
            } else if (!checkbox.checked && alreadyAdded) {
                console.log("removing the item from box: ",item)
                removeSelectedItem(item);
                categoryItem.classList.remove("selected");
            }
           
        });
    });

    

    // Function to add selected item to the top div
    function addSelectedItem(parts, categoryKey) {
        selectedItemsContainer.style.display = 'block'; // Show container when items are added
        var item = parts;
        
        //handles the session object to only use the name and not include the quantity
        if(Array.isArray(parts)){
            var item = parts[0];
        }
        
        
        // Prevent duplicates
        if (document.getElementById(`selected-${item.toLowerCase().replace(/\s+/g, '-')}`)) return;
        console.log(item, categoryKey);
        // Create a div for the selected ingredient
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('selected-item');
        itemDiv.id = `selected-${item.toLowerCase().replace(/\s+/g, '-')}`;
        itemDiv.dataset.itemName = item;

        // Create the quantity container (wraps the input field)
        const quantityContainer = document.createElement('div');
        quantityContainer.classList.add('quantity-container');

        const quantityInput = document.createElement('input');
        quantityInput.type = 'text';
        quantityInput.placeholder = 'Quantity';
        quantityInput.id = `quantity-${item.toLowerCase().replace(/\s+/g, '-')}`;
        

        //adds text back on reload if user had text. (defaults to nothing)
        if(Array.isArray(parts) && parts.length >1){
            let quantity = parts[1];
            if( quantity != '1'){
                quantityInput.value = quantity;
            }
        }

        quantityContainer.appendChild(quantityInput);

        const itemName = document.createElement('span');

        itemName.textContent = item;
        itemName.classList.add('ingredient-name');

        // Append the name and quantity container to the item div
        itemDiv.appendChild(itemName);
        itemDiv.appendChild(quantityContainer);


        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✖';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', () => {
            removeSelectedItem(item);

            const checkbox = document.getElementById(`${categoryKey}-${item.toLowerCase().replace(/\s+/g, '-')}`);
            if (checkbox) {
                checkbox.checked = false;
        
                
                const categoryItem = checkbox.closest('.category-item');
                if (categoryItem) {
                    categoryItem.classList.remove('selected');
                }
            }
        });

        // Append the remove button to the itemDiv
        itemDiv.appendChild(removeBtn);

        // Append itemDiv to selected items container
        selectedItemsDiv.appendChild(itemDiv);
        let list = makeIngredientList();
        console.log('Added selected item:', item); // For debugging
        console.log('Current list so far: ', list);
        // Clear the input field after adding the i
    }

    // Function to remove item from selected list
    function removeSelectedItem(item) {
        console.log("inside the removeSelectedItem ",item)
        const itemDiv = document.getElementById(`selected-${item.toLowerCase().replace(/\s+/g, '-')}`);
        if (itemDiv) {
            console.log("removed item: ", itemDiv);
            itemDiv.remove();
            let list = makeIngredientList();
            console.log("List should be smaller since an item was deleted", list);
            checkIfEmpty();
        }
    }

    clearItems.addEventListener("click", () => {
        const items = document.querySelectorAll('.selected-item');
    
        items.forEach(item => {
            let trimmed = item.dataset.itemName;
            console.log("in clearItems", trimmed);
            removeSelectedItem(trimmed);
        });
    })

    // Hide container if no items remain
    function checkIfEmpty() {
        if (selectedItemsDiv.children.length === 0) {
            selectedItemsContainer.style.display = 'none';
        }
    }

    //grabs items from session storage so that user can add or remove items if they forgot
    const rawOptions = JSON.parse(sessionStorage.getItem('selected_options') || "[]");
    if (rawOptions) {
        const selected_options = rawOptions;
        sessionStorage.setItem("selected_options", JSON.stringify(selected_options)); // Save for future reloads
        selected_options.forEach(option => {
            let parts = option.split(":");
            console.log("Loaded option:", parts);
            addSelectedItem(parts, 'ingredient-category');
        });
    } else {
        console.log("No selected-options element found");
    }

    function makeIngredientList(){
        const items = document.querySelectorAll('.selected-item');
        const updatedList = [];
    
        items.forEach(item => {
            //gets name of item selected
            const name = item.querySelector('.ingredient-name').textContent;
            //gets the qty for that specific ingredient
            const qtyElement = item.querySelector('input[type="text"]');
            qtyElement.addEventListener('input', makeIngredientList);
            //defaults to one if no value exists
            const qty = qtyElement.value || '1';
            console.log("inside function here is qty being passed from value ",qty);
            updatedList.push(`${name} :${qty}`);
        });
        document.getElementById("final_ingredients").value = updatedList.join(", ");
        //updates the session storage
        sessionStorage.setItem('selected_options', JSON.stringify(updatedList));
        return updatedList;

    }
    


//uses a promise so that we can implement a loading screen
document.getElementById("generateRecipeBtn").addEventListener("click", () => {
    const numRecipes = numRecipesDisplay.value;
    const finalList = makeIngredientList();


    //laoding screen
    document.getElementById("searchSection").style.display = "none";
    document.getElementById("loadingScreen").style.display = "block";
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    
    fetch('/post-recipe/', {
        method: 'POST',
        body: JSON.stringify({'ingredients':finalList, 'numberOfRecipes': numRecipes
        }),
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken') 
        }
    })
    //gets json data
    .then(response => {
        return response.json();
    })
    //redirects to new page
    .then(data => {
        console.log(data);
        sessionStorage.setItem('ai_response', JSON.stringify(data));

        window.location.href='/chefai/recipe/';
        });
    });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            // Does this cookie string begin with the name we want?
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


//this is for the login page
const themes = [
    {
        background: "#1A1A2E",
        color: "#FFFFFF",
        primaryColor: "#0F3460"
    },
    {
        background: "#461220",
        color: "#FFFFFF",
        primaryColor: "#E94560"
    },
    {
        background: "#192A51",
        color: "#FFFFFF",
        primaryColor: "#967AA1"
    },
    {
        background: "#F7B267",
        color: "#000000",
        primaryColor: "#F4845F"
    },
    {
        background: "#F25F5C",
        color: "#000000",
        primaryColor: "#642B36"
    },
    {
        background: "#231F20",
        color: "#FFF",
        primaryColor: "#BB4430"
    }
];

const setTheme = (theme) => {
    const root = document.querySelector(":root");
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--color", theme.color);
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--glass-color", theme.glassColor);
};

const displayThemeButtons = () => {
    const btnContainer = document.querySelector(".theme-btn-container");
    themes.forEach((theme) => {
        const div = document.createElement("div");
        div.className = "theme-btn";
        div.style.cssText = `background: ${theme.background}; width: 25px; height: 25px`;
        btnContainer.appendChild(div);
        div.addEventListener("click", () => setTheme(theme));
    });
};

displayThemeButtons();



