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

            // 🔥 Filter employees belonging to the latest quarter only
            const latestQuarterEmployees = employees.filter(emp => emp.quarter === latestQuarter);

            // 🔥 Extract categories from only the latest quarter employees
            const categories = [...new Set(latestQuarterEmployees.map(emp => emp.category))];
            // 👉 Dynamically extract categories

            populateQuarterDropdown(quarters);
            generateTabs(categories);
            fetchEmployeesForAllCategories(latestQuarter, categories);
        })
        .catch(error => console.error('Error fetching employees:', error))
        .finally(() => hideLoader());
}
function generateTabs(categories) {
    const tabsContainer = document.getElementById('myTab');
    const tabContentContainer = document.getElementById('myTabContent');
    
    tabsContainer.innerHTML = '';
    tabContentContainer.innerHTML = '';

    categories.forEach((category, index) => {
        const categoryId = category.toLowerCase().replace(/\s+/g, '-') + '-tab';
        const paneId = category.toLowerCase().replace(/\s+/g, '-') + '-pane';

        // Create tab
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.setAttribute('role', 'presentation');

        const button = document.createElement('button');
        button.className = `nav-link ${index === 0 ? 'active' : ''}`;
        button.id = categoryId;
        button.setAttribute('data-bs-toggle', 'tab');
        button.setAttribute('data-bs-target', `#${paneId}`);
        button.setAttribute('type', 'button');
        button.setAttribute('role', 'tab');
        button.innerText = category;

        li.appendChild(button);
        tabsContainer.appendChild(li);

        // Create tab pane
        const pane = document.createElement('div');
        pane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
        pane.id = paneId;
        pane.setAttribute('role', 'tabpanel');
        pane.setAttribute('aria-labelledby', categoryId);

        pane.innerHTML = `
            <div class="${category.toLowerCase().replace(/\s+/g, '-')}-container">
                <p class="small lh-sm opacity-75 text-center mt-4 mb-2">
                    ${category} award winners.
                </p>
                <p class="text-center display-6 mb-3">
                    Congratulations to the winners of "${category} Award"
                </p>
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4 justify-content-center" id="${categoryId}-winners"></div>
            </div>
        `;
        tabContentContainer.appendChild(pane);
    });
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


async function fetchEmployeesForAllCategories(quarter, categories) {
    showLoader();
    document.getElementById("active-quarter").innerHTML = `<div id="active-quarter">${quarter}</div>`;

    categories.forEach(category => {
        fetch(`http://localhost:9000/emp/${category}/${quarter}`)
            .then(response => response.json())
            .then(data => {
                const containerId = `${category.toLowerCase().replace(/\s+/g, '-')}-tab-winners`;
                if (containerId) {
                    populateWinners(data, `${category.toLowerCase().replace(/\s+/g, '-')}-tab-winners`);
                }
            })
            .catch(error => console.error(`Error fetching employees for ${category}:`, error))
            .finally(() => hideLoader());
    });
}


function fetchEmployeesByQuarter(quarter) {
    showLoader();

    // Fetch employees of the selected quarter
    fetch(`http://localhost:9000/achievers-employees`)
        .then(response => response.json())
        .then(data => {
            const employees = (data.emp || []).filter(emp => emp.epublic === true && emp.quarter === quarter);

            const categories = [...new Set(employees.map(emp => emp.category))];

            // 🔥 Clear old tabs and panes
            clearTabsAndPanes();

            // 🔥 Generate new tabs for the selected quarter
            generateTabs(categories);

            // 🔥 Fetch and display employees for the selected quarter and categories
            fetchEmployeesForAllCategories(quarter, categories);

            // 🔥 Reset the first tab as active
            resetToFirstTab();
        })
        .catch(error => console.error('Error fetching employees:', error))
        .finally(() => hideLoader());
}

function clearTabsAndPanes() {
    const tabsContainer = document.getElementById('myTab');
    const tabContentContainer = document.getElementById('myTabContent');

    tabsContainer.innerHTML = '';
    tabContentContainer.innerHTML = '';
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

    if (winners.length < 1) {
        container.innerHTML = '<p class="text-center">No winners for this category.</p>';
        return;
    }

    winners.forEach((winner, i) => {
        if (winner.epublic) {
            container.innerHTML += `
                <div class="col">
                    <div class="card h-100">
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