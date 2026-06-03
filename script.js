const baseUrl = "http://127.0.0.1:8083";
let editMedicineId = null;
let loggedInUser = null;
let remindedMedicines = [];

window.onload = function () {
    showRegisterPage();
};

function showRegisterPage() {
    document.getElementById("registerPage").classList.remove("hidden");
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dashboardPage").classList.add("hidden");
}

function showLoginPage() {
    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("dashboardPage").classList.add("hidden");
}


function openDashboard() {
    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dashboardPage").classList.remove("hidden");

    document.getElementById("welcomeName").innerText =
        "Hello, " + loggedInUser.name + " 👋";
loadEmergencyContact();
viewMedicines();
loadPatientMedicineHistory();
loadDashboard();
checkMedicineReminder();
loadMedicalHistory();
    
}

function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
}

async function registerUser() {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value.trim();

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    const response = await fetch(baseUrl + "/api/users/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, email, password, role: "PATIENT" })
    });

    const data = await response.json();

    if (data.id) {
        alert("Registration successful. Please login.");
        document.getElementById("loginEmail").value = email;
        showLoginPage();
    }
}
setInterval(checkMedicineReminder, 10000);

async function loginUser() {
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    const response = await fetch(baseUrl + "/api/users/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password })
    });

    const text = await response.text();

    if (text === "") {
        alert("Invalid email or password");
        return;
    }

    const data = JSON.parse(text);

    if (data.id) {
        loggedInUser = data;
        openDashboard();
    }
}

function logout() {
    loggedInUser = null;
    remindedMedicines = [];
    showLoginPage();
}

function showSection(sectionId) {
    document.getElementById("healthForm").classList.add("hidden");
    document.getElementById("medicineForm").classList.add("hidden");
    document.getElementById("emergencyForm").classList.add("hidden");
    document.getElementById("doctorForm").classList.add("hidden");

    document.getElementById(sectionId).classList.remove("hidden");
}

function playAlarmBeep() {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();

    setTimeout(() => {
        oscillator.stop();
    }, 1200);
}

async function saveHealthProfile() {
    const profile = {
        userId: loggedInUser.id,
        patientName: document.getElementById("patientName").value.trim(),
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        diseaseCategory: document.getElementById("healthCondition").value
    };

    if (!profile.patientName || !profile.age || !profile.gender || !profile.diseaseCategory) {
        alert("Please fill all health profile details");
        return;
    }

    await fetch(baseUrl + "/api/patients/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(profile)
    });

    alert("Health profile saved successfully");

    document.getElementById("patientName").value = "";
    document.getElementById("age").value = "";
    document.getElementById("gender").value = "";
    document.getElementById("healthCondition").value = "";
    document.getElementById("healthForm").classList.add("hidden");
}

  async function addMedicine() {
    const medicineName = document.getElementById("medicineName").value.trim();
    const dosage = document.getElementById("dosage").value.trim();
    const medicineTime = document.getElementById("medicineTime").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!medicineName || !dosage || !medicineTime || !startDate || !endDate) {
        alert("Please fill all medicine details");
        return;
    }

    const medicine = {
        userId: loggedInUser.id,
        medicineName: medicineName,
        dosage: dosage,
        medicineTime: medicineTime + ":00",
        startDate: startDate,
        endDate: endDate
    };

    const url = editMedicineId
        ? baseUrl + "/api/medicines/update/" + editMedicineId
        : baseUrl + "/api/medicines/add";

    const method = editMedicineId ? "PUT" : "POST";

    const response = await fetch(url, {
        method: method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(medicine)
    });

    const text = await response.text();

    if (text.includes("already exists")) {
        alert("This medicine already exists");
        return;
    }

    alert(editMedicineId ? "Medicine updated successfully" : "Medicine saved successfully");

    editMedicineId = null;

    document.getElementById("medicineName").value = "";
    document.getElementById("dosage").value = "";
    document.getElementById("medicineTime").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";

    document.getElementById("medicineForm").classList.add("hidden");

    viewMedicines();
    loadPatientMedicineHistory();
    loadDashboard();
}
async function saveEmergencyContact() {
    const contactName = document.getElementById("contactName").value.trim();
    const relation = document.getElementById("relation").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();

    if (!contactName || !relation || !phoneNumber) {
        alert("Please fill all emergency contact details");
        return;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
        alert("Phone number must be exactly 10 digits");
        return;
    }

    const contact = {
        userId: loggedInUser.id,
        contactName: contactName,
        relation: relation,
        phoneNumber: phoneNumber
    };
    const url = editContactId
    ? baseUrl + "/api/emergency/update/" + editContactId
    : baseUrl + "/api/emergency/add";

const method = editContactId ? "PUT" : "POST";

await fetch(url, {
    method: method,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(contact)
});

editContactId = null;

 

    alert("Emergency contact saved successfully");

    document.getElementById("contactName").value = "";
    document.getElementById("relation").value = "";
    document.getElementById("phoneNumber").value = "";

    document.getElementById("emergencyForm").classList.add("hidden");

    loadEmergencyContact();
    loadDashboard();
}
async function saveDoctorVisit() {
    const formData = new FormData();

    formData.append("userId", loggedInUser.id);
    formData.append("hospitalName", document.getElementById("hospitalName").value.trim());
    formData.append("doctorName", document.getElementById("doctorName").value.trim());
    formData.append("doctorQualification", "Not Added");
    formData.append("doctorSpecialist", document.getElementById("doctorSpecialist").value.trim());
    formData.append("patientCategory", "General");
    formData.append("checkupReason", document.getElementById("checkupReason").value.trim());
    formData.append("visitDate", document.getElementById("visitDate").value);
    formData.append("doctorPrescription", document.getElementById("doctorPrescription").value.trim());

    const file = document.getElementById("prescriptionFile").files[0];

    if (file) {
        formData.append("file", file);
    }

    await fetch(baseUrl + "/api/doctor-visits/add", {
        method: "POST",
        body: formData
    });

    alert("Doctor visit saved successfully");

    document.getElementById("hospitalName").value = "";
    document.getElementById("doctorName").value = "";
    document.getElementById("doctorSpecialist").value = "";
    document.getElementById("checkupReason").value = "";
    document.getElementById("visitDate").value = "";
    document.getElementById("doctorPrescription").value = "";
    document.getElementById("prescriptionFile").value = "";
    document.getElementById("doctorForm").classList.add("hidden");

    viewDoctorVisits();
    loadMedicalHistory();
    loadDashboard();
}
async function loadEmergencyContact() {

    const response = await fetch(
        baseUrl + "/api/emergency/user/" + loggedInUser.id
    );

    const contacts = await response.json();

    const div = document.getElementById("emergencyDetails");

    div.innerHTML = "";
    div.style.display = "none";

    if (contacts.length === 0) {
        div.innerHTML = "<p>No emergency contact added yet.</p>";
        return;
    }

    contacts.forEach(contact => {

        div.innerHTML += `

            <div class="emergency-card">

                <h3>${contact.contactName}</h3>

                <p>
                    <b>Relation:</b>
                    ${contact.relation}
                </p>

                <p>
                    <b>Phone:</b>
                    ${contact.phoneNumber}
                </p>

                <a class="call-btn"
                   href="tel:${contact.phoneNumber}">
                    Emergency Call
                </a>

                <button
                    class="edit-btn"
                    onclick="editEmergencyContact(
                        ${contact.id},
                        '${contact.contactName}',
                        '${contact.relation}',
                        '${contact.phoneNumber}'
                    )">
                    Edit Contact
                </button>

            </div>
        `;
    });
}

function toggleEmergencySection() {

    const div =
        document.getElementById("emergencyDetails");

    const button =
        event.target;

    if (div.style.display === "none") {

        div.style.display = "block";

        button.innerText =
            "Hide Emergency Contact";

    } else {

        div.style.display = "none";

        button.innerText =
            "Show Emergency Contact";
    }
}

async function viewMedicines() {
    const response = await fetch(baseUrl + "/api/medicines/user/" + loggedInUser.id);
    const medicines = await response.json();
    const activeMedicines = medicines.filter(medicine => medicine.reminderEnabled === true);

    const div = document.getElementById("medicineCards");
    div.innerHTML = "";

    if (medicines.length === 0) {
        div.innerHTML = "<p>No medicine added yet.</p>";
        return;
    }

  activeMedicines.forEach(medicine =>{
        div.innerHTML += `
            <div class="medicine-card"
             data-id="${medicine.id}"
     data-name="${medicine.medicineName}">
                <h3>${medicine.medicineName}</h3>
                <p><b>Dosage:</b> ${medicine.dosage}</p>
                <p><b>Time:</b> ${medicine.medicineTime}</p>
                <p><b>Start Date:</b> ${medicine.startDate}</p>
                <p><b>End Date:</b> ${medicine.endDate}</p>
                <button class="taken-btn"
onclick="markMedicineStatus(${medicine.id}, ${medicine.userId}, 'TAKEN')">
    Taken
</button>

<button class="missed-btn"
onclick="markMedicineStatus(${medicine.id}, ${medicine.userId}, 'MISSED')">
    Missed
</button>

<button class="delete-btn"
onclick="turnOffReminder(${medicine.id})">
    Stop Notification
</button>

 
            </div>
        `;
    });
}
async function turnOffReminder(id) {

    const confirmStop =
        confirm("Stop notification for this medicine?");

    if (!confirmStop) {
        return;
    }

    await fetch(
        baseUrl + "/api/medicines/reminder-off/" + id,
        {
            method: "PUT"
        }
    );

    alert("Notification stopped");
       document.getElementById("reminderBox").innerHTML =
        "<p>No reminder right now.</p>";

    viewMedicines();
    loadPatientMedicineHistory();
    loadDashboard();
}
async function markMedicineStatus(medicineId, userId, status) {

    const today = new Date().toISOString().split("T")[0];

    const medicineStatus = {
        medicineId: medicineId,
        userId: userId,
        date: today,
        status: status
    };

    await fetch(baseUrl + "/api/status/mark", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(medicineStatus)
    });

    alert("Medicine marked as " + status);

    document.getElementById("reminderBox").innerHTML =
        "<p>No reminder right now.</p>";

    loadPatientMedicineHistory();
    loadDashboard();
    
}

async function viewStatusHistory() {
    const statusResponse = await fetch(baseUrl + "/api/status/history/" + loggedInUser.id);
    const history = await statusResponse.json();

    const medicineResponse = await fetch(baseUrl + "/api/medicines/user/" + loggedInUser.id);
    const medicines = await medicineResponse.json();

    const medicineMap = {};

    medicines.forEach(medicine => {
        medicineMap[medicine.id] = medicine.medicineName;
    });

    const table = document.getElementById("statusHistoryTable");
    table.innerHTML = "";

    history.forEach(item => {
        const name = medicineMap[item.medicineId] || "Medicine Deleted";

    table.innerHTML += `
    <tr>
        <td>${item.medicineName}</td>
        <td>${item.medicinePeriod}</td>
        <td>${item.foodTiming}</td>
        <td>${item.date}</td>
        <td>${item.status}</td>
    </tr>
`;
    });
}

async function viewDoctorVisits() {
    const response = await fetch(baseUrl + "/api/doctor-visits/user/" + loggedInUser.id);
    const visits = await response.json();

    const div = document.getElementById("doctorVisitCards");
    if (!div) return;

    div.innerHTML = "";

    if (visits.length === 0) {
        div.innerHTML = "<p>No doctor visits found.</p>";
        return;
    }

    visits.forEach(visit => {
        div.innerHTML += `
            <div class="doctor-card">
                <h3>${visit.hospitalName}</h3>
                <p><b>Doctor:</b> ${visit.doctorName}</p>
                <p><b>Specialist:</b> ${visit.doctorSpecialist}</p>
                <p><b>Reason:</b> ${visit.checkupReason}</p>
                <p><b>Date:</b> ${visit.visitDate}</p>
                <p><b>Prescription:</b> ${visit.doctorPrescription}</p>
            </div>
        `;
    });
}
async function loadDashboard() {
    const userId = loggedInUser.id;

    const medicines = await (
        await fetch(baseUrl + "/api/medicines/user/" + userId)
    ).json();

    const history = await (
        await fetch(baseUrl + "/api/status/history/" + userId)
    ).json();

    const visits = await (
        await fetch(baseUrl + "/api/doctor-visits/user/" + userId)
    ).json();

    let takenCount = 0;
    let missedCount = 0;
    let pendingCount = 0;

    medicines.forEach(medicine => {
        const medicineStatuses = history.filter(
            item => item.medicineId === medicine.id
        );

        const latestStatus =
            medicineStatuses.length > 0
                ? medicineStatuses[medicineStatuses.length - 1].status
                : "PENDING";

        if (latestStatus === "TAKEN") {
            takenCount++;
        }

        if (latestStatus === "MISSED") {
            missedCount++;
        }
        if (latestStatus === "PENDING") {
           pendingCount++;
}
    });

    document.getElementById("totalMedicines").innerText = medicines.length;
    document.getElementById("takenCount").innerText = takenCount;
    document.getElementById("missedCount").innerText = missedCount;
    document.getElementById("doctorVisitCount").innerText = visits.length;
    document.getElementById("pendingCount").innerText = pendingCount;}


async function checkMedicineReminder() {
    if (!loggedInUser) return;

    const response = await fetch(baseUrl + "/api/medicines/user/" + loggedInUser.id);
    const medicines = await response.json();

    const currentTime = new Date().toTimeString().slice(0, 5);
    const reminderBox = document.getElementById("reminderBox");

    medicines.forEach(medicine => {
        const medicineTime = medicine.medicineTime.slice(0, 5);
        if (
    currentTime === medicineTime &&
    medicine.reminderEnabled === true &&
    !remindedMedicines.includes(medicine.id)
) {

      
            playAlarmBeep();

            remindedMedicines.push(medicine.id);

            alert("Time to take medicine: " + medicine.medicineName);

            reminderBox.innerHTML = `
                <div class="reminder-card">
                    <h3>🔔 Time to Take Your Medicine</h3>
                    <h2>${medicine.medicineName}</h2>
                    <p>${medicine.dosage}</p>
                    <h1>${medicine.medicineTime}</h1>

                    <button class="taken-btn" onclick="markMedicineStatus(${medicine.id}, ${medicine.userId}, 'TAKEN')">
                        Taken
                    </button>

                    <button class="missed-btn" onclick="markMedicineStatus(${medicine.id}, ${medicine.userId}, 'MISSED')">
                        Missed
                    </button>
                </div>
            `;
        }
    });
}

setInterval(checkMedicineReminder, 10000);

async function deleteMedicine(id) {
    const confirmDelete = confirm("Do you want to delete this medicine reminder?");

    if (!confirmDelete) {
        return;
    }

    await fetch(baseUrl + "/api/medicines/delete/" + id, {
        method: "DELETE"
    });

    alert("Medicine reminder deleted");

    remindedMedicines = remindedMedicines.filter(medicineId => medicineId !== id);

    viewMedicines();
    loadDashboard();

    document.getElementById("reminderBox").innerHTML =
        "<p>No reminder right now.</p>";
}
async function loadMedicalHistory() {

    const response =
        await fetch(
            baseUrl + "/api/doctor-visits/user/" + loggedInUser.id
        );

    const visits = await response.json();

    const container =
        document.getElementById("medicalHistoryContainer");

    container.innerHTML = "";

    if (visits.length === 0) {

        container.innerHTML =
            "<p>No medical history available.</p>";

        return;
    }

    visits.forEach(visit => {

        container.innerHTML += `

            <div class="history-card">

                <h3>${visit.doctorName}</h3>

                <p>
                    <b>Hospital:</b>
                    ${visit.hospitalName}
                </p>

                <p>
                    <b>Specialist:</b>
                    ${visit.doctorSpecialist}
                </p>

                <p>
                    <b>Reason:</b>
                    ${visit.checkupReason}
                </p>

                <p>
                    <b>Visit Date:</b>
                    ${visit.visitDate}
                </p>

                <p>
                    <b>Prescription:</b>
                    ${visit.doctorPrescription}
                </p>
                ${
    visit.prescriptionFileName
    ? `<p>
            <b>Uploaded File:</b>
            <a href="${baseUrl}/api/doctor-visits/file/${visit.prescriptionFileName}" target="_blank">
                View Prescription
            </a>
       </p>`
       
       
    : `<p><b>Uploaded File:</b> No file uploaded</p>`
}
<button class="delete-btn" onclick="deleteDoctorVisit(${visit.id})">
    Delete Record
</button>
 

            </div>
        `;
    });
}
function toggleMedicalHistory() {
    const div = document.getElementById("medicalHistoryContainer");
    const button = event.target;

    if (div.style.display === "none") {
        div.style.display = "block";
        button.innerText = "Hide Patient Medical History";
    } else {
        div.style.display = "none";
        button.innerText = "Show Patient Medical History";
    }
}
function toggleMedicineHistory() {

    const box = document.getElementById("medicineHistoryBox");
    const button = event.target;

    if (box.style.display === "none") {

        box.style.display = "block";

        document.getElementById("deleteMedicineBtn").style.display = "block";

        button.innerText = "Hide Medicine History";

    } else {

        box.style.display = "none";

        document.getElementById("deleteMedicineBtn").style.display = "none";

        document.getElementById("confirmDeleteBtn").classList.add("hidden");

        button.innerText = "Show Medicine History";
    }
}

async function loadPatientMedicineHistory() {

    const medicineResponse = await fetch(
        baseUrl + "/api/medicines/user/" + loggedInUser.id
    );
    const medicines = await medicineResponse.json();

    const statusResponse = await fetch(
        baseUrl + "/api/status/history/" + loggedInUser.id
    );
    const history = await statusResponse.json();

    const table = document.getElementById("statusHistoryTable");
    table.innerHTML = "";

    medicines.forEach(medicine => {

        const medicineStatuses = history.filter(
            item => item.medicineId === medicine.id
        );

        const latestStatus =
            medicineStatuses.length > 0
                ? medicineStatuses[medicineStatuses.length - 1].status
                : "PENDING";

    table.innerHTML += `
    <tr>
        <td class="delete-column hidden">
    <input type="checkbox" class="delete-check" value="${medicine.id}">
</td>

        <td>${medicine.medicineName}</td>
        <td>${medicine.dosage}</td>
        <td>${medicine.medicineTime}</td>
        <td>${medicine.startDate}</td>
        <td>${medicine.endDate}</td>

        <td>
            <select onchange="updateMedicineStatus(${medicine.id}, ${medicine.userId}, this.value)">
                <option value="PENDING" ${latestStatus === "PENDING" ? "selected" : ""}>PENDING</option>
                <option value="TAKEN" ${latestStatus === "TAKEN" ? "selected" : ""}>TAKEN</option>
                <option value="MISSED" ${latestStatus === "MISSED" ? "selected" : ""}>MISSED</option>
            </select>
        </td>

        <td>
            <button class="small-edit-btn" onclick="editMedicine(${medicine.id})"> + </button>
        </td>
    </tr>
`;
    });
}

async function updateMedicineStatus(medicineId, userId, status) {
    const today = new Date().toISOString().split("T")[0];

    const medicineStatus = {
        medicineId: medicineId,
        userId: userId,
        date: today,
        status: status
    };

    await fetch(baseUrl + "/api/status/mark", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(medicineStatus)
    });

    alert("Medicine status changed to " + status);

    loadPatientMedicineHistory();
    loadDashboard();
}
function showDashboardSection(sectionId) {
    document.querySelectorAll(".dashboard-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");
}
async function deleteDoctorVisit(id) {
    const confirmDelete = confirm("Delete this medical history record?");

    if (!confirmDelete) {
        return;
    }

    await fetch(baseUrl + "/api/doctor-visits/delete/" + id, {
        method: "DELETE"
    });

    alert("Medical history deleted");

    loadMedicalHistory();
    loadDashboard();
}
function editEmergencyContact(id, name, relation, phone) {

    document.getElementById("contactName").value = name;
    document.getElementById("relation").value = relation;
    document.getElementById("phoneNumber").value = phone;

    window.editContactId = id;

    showSection("emergencyForm");
}
let editContactId = null;

function editEmergencyContact(id, name, relation, phone) {
    editContactId = id;

    document.getElementById("contactName").value = name;
    document.getElementById("relation").value = relation;
    document.getElementById("phoneNumber").value = phone;

    showDashboardSection("dashboardContent");
    showSection("emergencyForm");
}
function enableMedicineDeleteMode() {
    document.querySelectorAll(".delete-column").forEach(col => {
        col.classList.remove("hidden");
    });

    document.getElementById("confirmDeleteBtn").classList.remove("hidden");
    document.getElementById("cancelDeleteBtn").classList.remove("hidden");
    document.getElementById("deleteMedicineBtn").classList.add("hidden");
}

function cancelMedicineDeleteMode() {
    document.querySelectorAll(".delete-column").forEach(col => {
        col.classList.add("hidden");
    });

    document.querySelectorAll(".delete-check").forEach(box => {
        box.checked = false;
    });

    document.getElementById("confirmDeleteBtn").classList.add("hidden");
    document.getElementById("cancelDeleteBtn").classList.add("hidden");
    document.getElementById("deleteMedicineBtn").classList.remove("hidden");
}
async function deleteSelectedMedicines() {
    const selected = document.querySelectorAll(".delete-check:checked");

    if (selected.length === 0) {
        alert("Please select medicine to delete");
        return;
    }

    if (!confirm("Delete selected medicine?")) {
        return;
    }

    for (let box of selected) {
        await fetch(baseUrl + "/api/medicines/delete/" + box.value, {
            method: "DELETE"
        });
    }

    alert("Medicine deleted successfully");

    cancelMedicineDeleteMode();

    loadPatientMedicineHistory();
    viewMedicines();
    loadDashboard();
}


async function editMedicine(id) {

    const response = await fetch(
        baseUrl + "/api/medicines/user/" + loggedInUser.id
    );

    const medicines = await response.json();

    const medicine = medicines.find(m => m.id === id);

    editMedicineId = id;

    document.getElementById("medicineName").value = medicine.medicineName;
    document.getElementById("dosage").value = medicine.dosage;
    document.getElementById("medicineTime").value = medicine.medicineTime.slice(0, 5);
    document.getElementById("startDate").value = medicine.startDate;
    document.getElementById("endDate").value = medicine.endDate;

    showDashboardSection("dashboardContent");
    showSection("medicineForm");
}

function cancelMedicineDeleteMode() {
    document.querySelectorAll(".delete-column").forEach(col => {
        col.classList.add("hidden");
    });

    document.querySelectorAll(".delete-check").forEach(box => {
        box.checked = false;
    });

    document.getElementById("confirmDeleteBtn").classList.add("hidden");
    document.getElementById("cancelDeleteBtn").classList.add("hidden");
    document.getElementById("deleteMedicineBtn").classList.remove("hidden");
}
function showDashboardSection(sectionId) {
    document.querySelectorAll(".dashboard-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");
}