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
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            const searchTerm = searchInput.value.trim().toLowerCase();

            Object.keys(ingredientCategories).forEach(categoryKey => {
                ingredientCategories[categoryKey].forEach(item => {
                    if (item.toLowerCase().includes(searchTerm)) {
                        const checkbox = document.getElementById(`${categoryKey}-${item.toLowerCase().replace(/\s+/g, '-')}`);

                        if (checkbox && !checkbox.checked) {
                            checkbox.checked = true;
                            addSelectedItem(item, categoryKey); // Add to selected items container
                        }
                    }
                });
            });
            searchInput.value = ''; // Clear search input
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
});
