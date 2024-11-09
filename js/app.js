// Global variables to track current state
let categoryWinners = {
    'pob-winners': [],
    'mvp-winners': [],
    'em-winners': [],
    'exl-winners': []
};
let currentCategory = '';
let currentWinnerIndex = 0;

document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault();
    fetchEmployees();
    document.getElementById('quarter-dropdown').addEventListener('change', (event) => {
        const selectedQuarter = event.target.value;
        fetchEmployeesByQuarter(selectedQuarter);
    });
});

function fetchEmployees() {
    fetch('http://localhost:9000/employees')
        .then(response => response.json())
        .then(data => { 
            const employees = data.emp || [];
            const quarters = [...new Set(employees.map(emp => emp.quater))];
            
            // Sort quarters in descending order
            quarters.sort((a, b) => {
                const [yearA, quarterA] = a.split('Q');
                const [yearB, quarterB] = b.split('Q');
                return yearB - yearA || quarterB - quarterA;
            });   
            
            const latestQuarter = quarters[0]; 
            populateQuarterDropdown(quarters);
            fetchEmployeesForAllCategories(latestQuarter);
        })
        .catch(error => console.error('Error fetching employees:', error));
}

function populateQuarterDropdown(quarters) {
    const dropdown = document.getElementById('quarter-dropdown');
    dropdown.innerHTML = '';

    quarters.forEach(quarter => {
        if (quarter) {
            const option = document.createElement('option');
            option.value = quarter;
            option.text = quarter;
            dropdown.appendChild(option);
        }
    });
}

function fetchEmployeesForAllCategories(quarter) {
    const categories = ['Pat on the back', 'Most valuable Player', 'Excelearn', 'Extra Miler'];

    categories.forEach(category => {
        fetch(`http://localhost:9000/emp/${category}/${quarter}`)
            .then(response => response.json())
            .then(data => {
                const employees = data;
                let containerId = getCategoryContainerId(category);
                if (containerId) {
                    populateWinners(employees, containerId);
                }
            })
            .catch(error => console.error(`Error fetching employees for ${category}:`, error));
    });
}

function fetchEmployeesByQuarter(quarter) {
    const categories = ['Pat on the back', 'Most valuable Player', 'Excelearn', 'Extra Miler'];

    categories.forEach(category => {
        fetch(`http://localhost:9000/emp/${category}/${quarter}`)
            .then(response => response.json())
            .then(data => {
                const employees = data;
                let containerId = getCategoryContainerId(category);
                if (containerId) {
                    populateWinners(employees, containerId);
                }
            })
            .catch(error => console.error(`Error fetching employees for ${category}:`, error));
    });
}

function getCategoryContainerId(category) {
    switch (category) {
        case 'Pat on the back':
            return 'pob-winners';
        case 'Most valuable Player':
            return 'mvp-winners';
        case 'Extra Miler':
            return 'em-winners';
        case 'Excelearn':
            return 'exl-winners';
        default:
            console.error(`Unknown category: ${category}`);
            return null;
    }
}

function getCategoryTitle(containerId) {
    switch (containerId) {
        case 'pob-winners':
            return 'Pat on the Back';
        case 'mvp-winners':
            return 'Most Valuable Player';
        case 'em-winners':
            return 'Extra Miler';
        case 'exl-winners':
            return 'Excelearn';
        default:
            return 'Employee Details';
    }
}

function populateWinners(winners, containerId) {
    const container = document.getElementById(containerId);
    if(container.innerHTML != '') {
        container.innerHTML = '';
    }

    // Store winners for this specific category
    categoryWinners[containerId] = winners.filter(winner => winner.name);

    if (winners.length < 2) {   
        container.innerHTML = '<p class="text-center">No winners for this category.</p>';
        return;
    }
    categoryWinners[containerId].forEach((winner, i) => {
      
            container.innerHTML += `
            <div class="col">
            <div class="card h-100" onclick="openEmployeeModal('${containerId}', ${i})">
            <img src="${winner.photo}" class="card-img-top" alt="${winner.name}" />
            <div class="card-body py-2">
            <h5 class="card-title">${winner.name}</h5>
            <p class="card-text mb-0"><small class="text-body-secondary">${winner.role}</small></p>
            </div>
            </div>
            </div>`;
            
    });
}

function openEmployeeModal(containerId, index) {
    currentCategory = containerId;
    currentWinnerIndex = index;
    const winner = categoryWinners[containerId][currentWinnerIndex];
    
    const categoryTitle = getCategoryTitle(containerId);
    document.getElementById('employeeModalLabel').textContent = categoryTitle;
    
    updateModalContent(winner);
    updateNavigationButtons();
    
    const employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'));
    employeeModal.show();
}

function updateModalContent(winner) {
    document.getElementById('employeeModalImage').src = winner.photo;
    document.getElementById('employeeModalName').textContent = winner.name;
    document.getElementById('employeeModalRole').textContent = winner.role;
    document.getElementById('employeeModalDescription').textContent = winner.remarks || "No remarks available";
}

function updateNavigationButtons() {
    document.getElementById("prevEmployee").style.display="block"
    document.getElementById("nextEmployee").style.display="block"
    const prevButton = document.getElementById('prevEmployee');
    const nextButton = document.getElementById('nextEmployee');
    const counter = document.getElementById('employeeCounter');
    
    const currentWinners = categoryWinners[currentCategory];
    
    if(currentWinnerIndex===0)
    document.getElementById("prevEmployee").style.display="none"
else{

}
    if(currentWinnerIndex === currentWinners.length - 1)
    document.getElementById("nextEmployee").style.display="none"
else{

}
    prevButton.disabled = currentWinnerIndex === 0;
    nextButton.disabled = currentWinnerIndex === currentWinners.length - 1;

    counter.textContent = `${currentWinnerIndex + 1} of ${currentWinners.length}`;
}

function navigateEmployee(direction) {
    currentWinnerIndex += direction;
    const currentWinners = categoryWinners[currentCategory];
    
    if (currentWinnerIndex < 0) currentWinnerIndex = 0;
    if (currentWinnerIndex >= currentWinners.length) {
        currentWinnerIndex = currentWinners.length - 1;
    }
    
    const winner = currentWinners[currentWinnerIndex];
    updateModalContent(winner);
    updateNavigationButtons();
}

document.addEventListener('keydown', (event) => {
    const modal = document.getElementById('employeeModal');
    if (modal.classList.contains('show')) {
        if (event.key === 'ArrowLeft') {
            navigateEmployee(-1);
        } else if (event.key === 'ArrowRight') {
            navigateEmployee(1);
        }
    }
});