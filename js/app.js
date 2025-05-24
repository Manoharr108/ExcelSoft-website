
let categoryWinners = {
    'pob-winners': [],
    'mvp-winners': [],
    'em-winners': [],
    'exl-winners': []
};

let currentCategory = '';
let currentWinnerIndex = 0;


function showLoader() {
    document.getElementById('loader').classList.remove('d-none');
}

function hideLoader() {
    document.getElementById('loader').classList.add('d-none');
}

document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault();
    fetchEmployees();
    document.getElementById('quarter-dropdown').addEventListener('change', (event) => {
        const selectedQuarter = event.target.value;
        fetchEmployeesByQuarter(selectedQuarter);
        document.getElementById("active-quarter").innerHTML = `<div id="active-quarter">${selectedQuarter}</div>`;
    });
});

function fetchEmployees() {
    showLoader();
    fetch('http://localhost:9000/achievers-employees')
        .then(response => response.json())
        .then(data => { 
            const employees = (data.emp || []).filter(emp => emp.epublic === true);
            const quarters = [...new Set(employees.map(emp => emp.quarter))];
            
            quarters.sort((a, b) => {
                const [yearA, quarterA] = a.split('Q');
                const [yearB, quarterB] = b.split('Q');
                return yearB - yearA || quarterB - quarterA;
            });   
            
            const latestQuarter = quarters[0]; 
            populateQuarterDropdown(quarters);
            fetchEmployeesForAllCategories(latestQuarter);
        })
        .catch(error => console.error('Error fetching employees:', error))
        .finally(() => hideLoader());
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

async function fetchEmployeesForAllCategories(quarter) {
    showLoader();
    const categories = ['Pat on the back', 'Most valuable Player', 'Excelearn', 'Extra Miler'];
    document.getElementById("active-quarter").innerHTML = `<div id="active-quarter">${quarter}</div>`;
    
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
            .catch(error => console.error(`Error fetching employees for ${category}:`, error))
            .finally(() => hideLoader());
    });
}

function fetchEmployeesByQuarter(quarter) {
    showLoader();
    resetToFirstTab();

    const categories = ['Pat on the back', 'Most valuable Player', 'Excelearn', 'Extra Miler'];
    document.getElementById('active-quarter').value = "quarter";
    categories.forEach(category => {
        fetch(`http://localhost:9000/emp/${category}/${quarter}`)
            .then(response => response.json())
            .then(data => {
                const containerId = getCategoryContainerId(category);
                if (containerId) {
                    populateWinners(data, containerId);
                }
            })
            .catch(error => console.error(`Error fetching employees for category "${category}" in quarter "${quarter}":`, error))
            .finally(() => hideLoader());
    });
}

function resetToFirstTab() {
    const firstTabButton = document.querySelector('.nav-tabs .nav-link:first-child');
    const firstTabContent = document.querySelector('.tab-content .tab-pane:first-child');

    if (firstTabButton && firstTabContent) {
        document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content .tab-pane').forEach(pane => pane.classList.remove('active', 'show'));

        firstTabButton.classList.add('active');
        firstTabContent.classList.add('active', 'show');
    }
}

function getCategoryContainerId(category) {
    switch (category) {
        case 'Pat on the back': return 'pob-winners';
        case 'Most valuable Player': return 'mvp-winners';
        case 'Extra Miler': return 'em-winners';
        case 'Excelearn': return 'exl-winners';
        default: return null;
    }
}

function getCategoryTitle(containerId) {
    switch (containerId) {
        case 'pob-winners': return 'Pat on the Back';
        case 'mvp-winners': return 'Most Valuable Player';
        case 'em-winners': return 'Extra Miler';
        case 'exl-winners': return 'Excelearn';
        default: return 'Employee Details';
    }
}

function populateWinners(winners, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    categoryWinners[containerId] = winners.filter(winner => winner.name);

    if (winners.length < 2) {   
        container.innerHTML = '<p class="text-center">No winners for this category.</p>';
        return;
    }

    categoryWinners[containerId].forEach((winner, i) => {
        if(winner.epublic){
            container.innerHTML += `
            <div class="col">
                <div class="card h-100" onclick="openEmployeeModal('${containerId}', ${i})">
                    <img src="${getEmployeePhotoUrl(winner.empid)}"
                         class="card-img-top" 
                         alt="${winner.name}"
                         onerror="this.src='${getDefaultPhotoUrl()}'" />
                    <div class="card-body py-2">
                        <h5 class="card-title">${winner.name}</h5>
                        <p class="card-text mb-0"><small class="text-body-secondary">${winner.role}</small></p>
                    </div>
                </div>
            </div>`;
        }
    });
}

function openEmployeeModal(containerId, index) {
    currentCategory = containerId;
    currentWinnerIndex = index;
    const winner = categoryWinners[containerId][currentWinnerIndex];
    
    document.getElementById('employeeModalLabel').textContent = getCategoryTitle(containerId);
    updateModalContent(winner);
    updateNavigationButtons();
    
    new bootstrap.Modal(document.getElementById('employeeModal')).show();
}

function updateModalContent(winner) {
    const modalImage = document.getElementById('employeeModalImage');
    modalImage.src = getEmployeePhotoUrl(winner.empid);
    modalImage.onerror = () => modalImage.src = getDefaultPhotoUrl();
    
    document.getElementById('employeeModalName').textContent = winner.name;
    document.getElementById('employeeModalRole').textContent = winner.role;
    document.getElementById('employeeModalDescription').textContent = winner.remarks || "No remarks available";
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prevEmployee');
    const nextButton = document.getElementById('nextEmployee');
    const currentWinners = categoryWinners[currentCategory];

    prevButton.style.display = currentWinnerIndex === 0 ? 'none' : 'block';
    nextButton.style.display = currentWinnerIndex === currentWinners.length - 1 ? 'none' : 'block';
    document.getElementById('employeeCounter').textContent = `${currentWinnerIndex + 1} of ${currentWinners.length}`;
}

function navigateEmployee(direction) {
    currentWinnerIndex += direction;
    const currentWinners = categoryWinners[currentCategory];
    
    if (currentWinnerIndex < 0) currentWinnerIndex = 0;
    if (currentWinnerIndex >= currentWinners.length) currentWinnerIndex = currentWinners.length - 1;
    
    updateModalContent(currentWinners[currentWinnerIndex]);
    updateNavigationButtons();
}

document.addEventListener('keydown', (event) => {
    const modal = document.getElementById('employeeModal');
    if (modal.classList.contains('show')) {
        if (event.key === 'ArrowLeft') navigateEmployee(-1);
        if (event.key === 'ArrowRight') navigateEmployee(1);
    }
});