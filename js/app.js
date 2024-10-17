document.addEventListener('DOMContentLoaded', () => {
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
            const quarters = [...new Set(employees.map(emp => emp.quater))] 
                .filter(quarter => quarter !== undefined && quarter !== null) 
                .sort(); 
            console.log(quarters)
            populateQuarterDropdown(quarters);

            const latestQuarter = quarters[0]; 
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

    const categories = ['Pat on the back', 'Most valuable Player', 'ExceLearn', 'Extra Miler'];

    categories.forEach(category => {
        fetch(`http://localhost:9000/emp/${category}/${quarter}`)
            .then(response => response.json())
            .then(data => {
                const employees = data;
                let containerId;
                switch (category) {
                    case 'Pat on the back':
                        containerId = 'pob-winners';
                        break;
                    case 'Most valuable Player':
                        containerId = 'mvp-winners';
                        break;
                    case 'Extra Miler':
                        containerId = 'em-winners';
                        break;
                    case 'ExceLearn':
                        containerId = 'exl-winners';
                        break;
                    default:
                        console.error(`Unknown category: ${category}`);
                        return; // Exit if the category is unknown
                }

                // Populate the winners for the category using the determined container ID
                populateWinners(employees, containerId);
            })
            .catch(error => console.error(`Error fetching employees for ${category}:`, error));
    });
}


function fetchEmployeesByQuarter(quarter) {
    const categories = ['Pat on the back', 'Most valuable Player', 'ExceLearn', 'Extra Miler'];

    categories.forEach(category => {
        fetch(`http://localhost:9000/emp/${category}/${quarter}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                const employees = data;
                // Determine the container ID based on the category
                let containerId;
                switch (category) {
                    case 'Pat on the back':
                        containerId = 'pob-winners';
                        break;
                    case 'Most valuable Player':
                        containerId = 'mvp-winners';
                        break;
                    case 'ExceLearn':
                        containerId = 'exl-winners';
                        break;
                    case 'Extra Miler':
                        containerId = 'em-winners';
                        break;
                    default:
                        console.error(`Unknown category: ${category}`);
                        return; // Exit if the category is unknown
                }

                populateWinners(employees, containerId);
            })
            .catch(error => console.error(`Error fetching employees for ${category}:`, error));
    });
}


function populateWinners(winners, containerId) {
    const container = document.getElementById(containerId);
    if(container.innerHTML!= ''){
        container.innerHTML = '';
    }

    if (winners.length < 2) {
        container.innerHTML = '<p class="text-center">No winners for this category.</p>';
        return;
    }

    winners.forEach((winner) => {
        if(winner.name){
            document.getElementById(containerId).innerHTML+= `
            <div class="col">
            <div class="card h-100">
                    <img src="${winner.photo}" class="card-img-top" alt="${winner.name}" />
                    <div class="card-body py-2">
                    <h5 class="card-title">${winner.name}</h5>
                    <p class="card-text mb-0"><small class="text-body-secondary">${winner.role}</small></p>
                       
                        </div>
                        </div>
                        </div>
                        `;
                        }
        });
}




