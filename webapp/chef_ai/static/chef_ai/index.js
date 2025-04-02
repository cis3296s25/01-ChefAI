let i = 0;
let placeholder = "";
const txt = "Search ingredients...";
const speed = 300;

function type(){
    placeholder += txt.charAt(i);
    document.getElementById('searchInput').setAttribute("placeholder", placeholder);
    i++;
    setTimeout(type, speed);
}

type();

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
    const chefItUpBtn = document.getElementById('chefItUpBtn');
    const mainContent = document.querySelector('.content');
    const searchSection = document.getElementById('searchSection');
    const searchInput = document.getElementById('searchInput');
    const selectedItemsContainer = document.getElementById('selectedItemsContainer');
    const selectedItemsDiv = document.getElementById('selectedItems');
    const video = document.querySelector('.back-video');
    const form = document.querySelector("form");

    form.addEventListener("submit", (e) => {
        if (document.activeElement === searchInput) {
            e.preventDefault(); // Block submission if user is typing and hits enter in the search bar
        }
    });

    createCategoryItems(); // Generate ingredient checkboxes

    // Show search section when "Let's Chef it up!" is clicked
    chefItUpBtn.addEventListener('click', (e) => {
        e.preventDefault();

        mainContent.style.display = 'none';
        searchSection.style.display = 'block';

        searchInput.focus();

        video.pause();
        video.currentTime = video.duration;
        video.style.filter = 'blur(8px)';
    });

    // Search and select ingredients
    const suggestionBox = document.getElementById("searchSuggestions");
    searchInput.addEventListener('keyup', async (event) => {
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
            if (data.results.length > 0) {
                data.results.forEach(result => {
                    const suggestion = document.createElement("div"); // To make each match as a clickable div
                    suggestion.textContent = result;
                    suggestion.addEventListener("click", () => {
                        Object.keys(ingredientCategories).forEach(categoryKey => { // Currently only checks with the hardcoded ingredient categories
                            ingredientCategories[categoryKey].forEach(item => {
                                // Selects the checkbox and adds to UI
                                if (item.toLowerCase() === result.toLowerCase()) {
                                    const checkboxId = `${categoryKey}-${item.toLowerCase().replace(/\s+/g, '-')}`;
                                    const checkbox = document.getElementById(checkboxId);
                                    if (checkbox && !checkbox.checked) {
                                        checkbox.checked = true;
                                        addSelectedItem(item, categoryKey);
                                    }
                                }
                            });
                        });
                        // Clears input and hides dropdown after user clicks a suggestion
                        searchInput.value = '';
                        suggestionBox.innerHTML = '';
                        suggestionBox.style.display = "none";
                    });
                    suggestionBox.appendChild(suggestion);
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

    // Hides the dropdown if user clicks anywhere on the page
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.style.display = "none";
        }
    });

    // Add event listeners for manual checkbox clicks
    document.querySelectorAll('.category-items').forEach(category => {
        category.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                if (e.target.checked) {
                    addSelectedItem(e.target.name, e.target.id.split('-')[0]);
                } else {
                    removeSelectedItem(e.target.name);
                }
            }
        });
    });

    // Function to add selected item to the top div
    function addSelectedItem(item, categoryKey) {
        selectedItemsContainer.style.display = 'block'; // Show container when items are added

        // Prevent duplicates
        if (document.getElementById(`selected-${item.toLowerCase().replace(/\s+/g, '-')}`)) return;

        // Create a div for the selected ingredient
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('selected-item');
        itemDiv.id = `selected-${item.toLowerCase().replace(/\s+/g, '-')}`;

        // Create the quantity container (wraps the input field)
        const quantityContainer = document.createElement('div');
        quantityContainer.classList.add('quantity-container');

        const quantityInput = document.createElement('input');
        quantityInput.type = 'text';
        quantityInput.placeholder = 'Qty'
        quantityInput.id = `quantity-${item.toLowerCase().replace(/\s+/g, '-')}`;

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
            itemDiv.remove();
            document.getElementById(`${categoryKey}-${item.toLowerCase().replace(/\s+/g, '-')}`).checked = false;
            checkIfEmpty();
        });

        // Append the remove button to the itemDiv
        itemDiv.appendChild(removeBtn);

        // Append itemDiv to selected items container
        selectedItemsDiv.appendChild(itemDiv);
        console.log('Added selected item:', item); // For debugging
        // Clear the input field after adding the i
    }

    // Function to remove item from selected list
    function removeSelectedItem(item) {
        const itemDiv = document.getElementById(`selected-${item.toLowerCase().replace(/\s+/g, '-')}`);
        if (itemDiv) {
            itemDiv.remove();
            checkIfEmpty();
        }
    }

    // Hide container if no items remain
    function checkIfEmpty() {
        if (selectedItemsDiv.children.length === 0) {
            selectedItemsContainer.style.display = 'none';
        }
    }

    document.getElementById("generateRecipeBtn").addEventListener("click", () => {
        const items = document.querySelectorAll('.selected-item');
        const final = [];
    
        items.forEach(item => {
            const name = item.querySelector('.ingredient-name').textContent;
            const qty = item.querySelector('input[type="text"]').value || '1';
            final.push(`${name} (${qty})`);
        });
    
        document.getElementById("final_ingredients").value = final.join(", ");
        console.log("Final Ingredients:", final); // For debugging
    });
    
});
