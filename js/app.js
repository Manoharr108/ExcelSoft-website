let categoryWinners = {
    'mvp-winners': [],
    'exl-winners': [],
    'em-winners': [],
    'pob-winners': []
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

    // Add the "more" option
    const option = document.createElement('option');
    option.value = "more";
    option.text = "more";
    dropdown.appendChild(option);

    // Add onchange event to handle redirection
    dropdown.onchange = function () {
        if (this.value === "more") {
            window.location.href = "https://es-homepage.excelindia.com/es-homepage/";
        } else {
            // Call your quarter selection handler here if needed
            // console.log("Selected Quarter: " + this.value);
        }
    };
}


async function fetchEmployeesForAllCategories(quarter) {
    showLoader();
    const categories = [ 'Most valuable Player', 'Extra Miler', 'Excelearn','Pat on the back'];
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

    const categories = [ 'Most valuable Player', 'Extra Miler', 'Excelearn','Pat on the back'];
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
        case 'Most valuable Player': return 'mvp-winners';
        case 'Extra Miler': return 'em-winners';
        case 'Excelearn': return 'exl-winners';
        case 'Pat on the back': return 'pob-winners';
        default: return null;
    }
}

function getCategoryTitle(containerId) {
    switch (containerId) {
        case 'mvp-winners': return 'Most Valuable Player';
        case 'em-winners': return 'Extra Miler';
        case 'exl-winners': return 'Excelearn';
        case 'pob-winners': return 'Pat on the Back';
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

async function fetchQuickLinks() {
    SetLoading(true);
    try {
        let res = await fetch('http://localhost:9000/quicklinks'); // Replace with your API endpoint
        let data = await res.json();
        appendQuickLinks(data);
    } catch (err) {
        console.error('Error fetching quick links', err);
        alert('Error fetching quick links.');
    } finally {
        SetLoading(false);
    }
}

function SetLoading(isLoading) {
    const loader = document.getElementById('loader');
    if (isLoading) {
        loader.classList.remove('d-none');
    } else {
        loader.classList.add('d-none');
    }
}

function appendQuickLinks(data) {
    const menuContainer = document.querySelector('.offcanvas-body.sideMnu');
    menuContainer.innerHTML = ''; // Clear old content to prevent duplicates

    data.forEach(section => {
        const publicLinks = section.links.filter(link => link.epublic);
        if (publicLinks.length === 0) return;

        let listGroup = document.createElement('div');
        listGroup.className = 'list-group mb-4';

        let heading = document.createElement('h6');
        heading.textContent = section.category;

        let ul = document.createElement('ul');
        ul.className = 'list-group';

        publicLinks.forEach(link => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            a.target = '_blank'; // Open in new tab

            li.appendChild(a);
            ul.appendChild(li);
        });

        listGroup.appendChild(heading);
        listGroup.appendChild(ul);
        menuContainer.appendChild(listGroup);
    });
}

// Optional: Fetch quick links immediately when page loads
window.addEventListener('DOMContentLoaded', fetchQuickLinks);