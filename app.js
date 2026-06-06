const USERS = {
  inspector1: {
    password: "inspector1",
    role: "Inspector",
    message: "Inspector workspace is ready for the inspection workflow."
  },
  manager1: {
    password: "manager1",
    role: "Manager",
    message: "Manager workspace is ready for report review."
  },
  safetyrep1: {
    password: "safetyrep1",
    role: "Safety Representative",
    message: "Safety representative workspace is ready for joint review."
  },
  maintenance1: {
    password: "maintenance1",
    role: "Maintenance Organizer",
    message: "Maintenance organizer workspace is ready for maintenance intake."
  }
};

const loginView = document.querySelector("#loginView");
const loggedInView = document.querySelector("#loggedInView");
const loginForm = document.querySelector("#loginForm");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const errorMessage = document.querySelector("#errorMessage");
const logoutButton = document.querySelector("#logoutButton");
const workspaceBody = document.querySelector("#workspaceBody");
const issueModal = document.querySelector("#issueModal");
const closeIssueModal = document.querySelector("#closeIssueModal");
const cancelIssueModal = document.querySelector("#cancelIssueModal");
const departmentSelect = document.querySelector("#departmentSelect");
const zoneSelect = document.querySelector("#zoneSelect");
const rackSelect = document.querySelector("#rackSelect");
const duplicateAlert = document.querySelector("#duplicateAlert");
const overdueAlert = document.querySelector("#overdueAlert");
const scheduleSection = document.querySelector("#scheduleSection");
const uploadSection = document.querySelector("#uploadSection");
const rackImageInput = document.querySelector("#rackImageInput");
const fileName = document.querySelector("#fileName");
const modalContent = document.querySelector(".modal-content");
const analysisContent = document.querySelector("#analysisContent");
const classificationContent = document.querySelector("#classificationContent");
const protocolContent = document.querySelector("#protocolContent");
const nextIssueButton = document.querySelector("#nextIssueButton");
const backIssueButton = document.querySelector("#backIssueButton");
const dropZone = document.querySelector("#dropZone");
const redCount = document.querySelector("#redCount");
const yellowCount = document.querySelector("#yellowCount");
const greenCount = document.querySelector("#greenCount");
const totalCount = document.querySelector("#totalCount");
const protocolDate = document.querySelector("#protocolDate");
const protocolLocation = document.querySelector("#protocolLocation");
const protocolBuilding = document.querySelector("#protocolBuilding");
const protocolItemNumber = document.querySelector("#protocolItemNumber");
const protocolError = document.querySelector("#protocolError");
const viewerLayer = document.querySelector("#viewerLayer");
const viewerTitle = document.querySelector("#viewerTitle");
const viewerContent = document.querySelector("#viewerContent");
const closeViewer = document.querySelector("#closeViewer");

const submittedReports = [];
const maintenanceReports = [];
const assignments = [];
let duplicateAlertKey = "";

function renderInspectorWorkspace() {
  const reportCountLabel = `${submittedReports.length} report(s)`;
  const reportsMarkup = submittedReports.length
    ? submittedReports.map((report) => `
        <article class="report-card">
          <div>
            <strong>${report.title}</strong>
            <span>${report.status}</span>
          </div>
          <div class="report-actions">
            <button type="button" data-view-image="${report.id}">View image</button>
            <button type="button" data-view-report="${report.id}">View report</button>
          </div>
        </article>
      `).join("")
    : `<p class="empty-state">Nothing yet.</p>`;

  workspaceBody.innerHTML = `
    <div class="role-page">
      <div class="role-heading">
        <p>Inspector</p>
        <h2>Inspection workspace</h2>
      </div>

      <div class="accordion-list">
        <details class="accordion-panel">
          <summary>
            <span>Previous inspection reports</span>
            <small>${reportCountLabel}</small>
          </summary>
          <div class="failed-reports">
            ${reportsMarkup}
          </div>
        </details>

        <details class="accordion-panel" open>
          <summary>
            <span>Report new issue</span>
            <small>Create inspection intake</small>
          </summary>
          <div class="new-issue-panel">
            <p>Select the affected rack location and upload inspection images for assessment.</p>
            <button type="button" id="openIssueModal">New issue</button>
          </div>
        </details>
      </div>
    </div>
  `;

  document.querySelector("#openIssueModal").addEventListener("click", openIssueModal);
  document.querySelectorAll("[data-view-image]").forEach((button) => {
    button.addEventListener("click", () => openImageViewer(button.dataset.viewImage));
  });
  document.querySelectorAll("[data-view-report]").forEach((button) => {
    button.addEventListener("click", () => openReportViewer(button.dataset.viewReport));
  });
}

function renderManagerWorkspace() {
  const inspectionReportsMarkup = submittedReports.length
    ? submittedReports.map((report) => `
        <article class="report-card">
          <div>
            <strong>${report.title}</strong>
            <span>${report.status}</span>
          </div>
          <div class="report-actions">
            <button type="button" data-manager-view-image="${report.id}">View image</button>
            <button type="button" data-manager-proceed="${report.id}">View and proceed</button>
          </div>
        </article>
      `).join("")
    : `<p class="empty-state">Nothing yet.</p>`;

  const maintenanceReportsMarkup = maintenanceReports.length
    ? maintenanceReports.map((report) => `
        <article class="report-card">
          <div>
            <strong>${report.rack} - ${report.department} - ${report.building}</strong>
            <span>${maintenanceStatusFor(report, "manager")}</span>
          </div>
          <div class="report-actions">
            <button type="button" data-edit-maintenance="${report.id}">Edit</button>
          </div>
        </article>
      `).join("")
    : `<p class="empty-state">Nothing yet.</p>`;

  workspaceBody.innerHTML = `
    <div class="role-page">
      <div class="role-heading">
        <p>Manager</p>
        <h2>Manager workspace</h2>
      </div>

      <div class="accordion-list">
        <details class="accordion-panel" open>
          <summary>
            <span>Inspection reports</span>
            <small>${submittedReports.length} report(s)</small>
          </summary>
          <div class="failed-reports">
            ${inspectionReportsMarkup}
          </div>
        </details>

        <details class="accordion-panel">
          <summary>
            <span>Maintenance reports</span>
            <small>${maintenanceReports.length} reports</small>
          </summary>
          <div class="failed-reports">
            ${maintenanceReportsMarkup}
          </div>
        </details>

        <details class="accordion-panel">
          <summary>
            <span>Analytics</span>
            <small>Safety overview</small>
          </summary>
          <div class="analytics-dashboard">
            <div class="analytics-metrics">
              <article>
                <strong>148</strong>
                <span>Total racks registered</span>
                <small>All selected locations</small>
              </article>
              <article class="metric-danger">
                <strong>7</strong>
                <span>Out of service</span>
                <small>+3 vs last month</small>
              </article>
              <article class="metric-warning">
                <strong>12</strong>
                <span>Overdue inspections</span>
                <small>+5 vs last month</small>
              </article>
              <article class="metric-good">
                <strong>94%</strong>
                <span>Compliance rate</span>
                <small>Target: 97%</small>
              </article>
            </div>

            <div class="analytics-grid">
              <section class="analytics-panel">
                <div class="analytics-panel-heading">
                  <h3>Defects by building / zone</h3>
                  <span id="buildingChartValue">Select a bar</span>
                </div>
                <div class="horizontal-chart" id="buildingChart">
                  <button type="button" data-label="Building C - Zone 3" data-value="17">
                    <span>Building C - Zone 3</span><i style="--bar: 100%"></i><b>17</b>
                  </button>
                  <button type="button" data-label="Building A - Zone 1" data-value="11">
                    <span>Building A - Zone 1</span><i style="--bar: 65%"></i><b>11</b>
                  </button>
                  <button type="button" data-label="Building F - Zone 2" data-value="8">
                    <span>Building F - Zone 2</span><i style="--bar: 47%"></i><b>8</b>
                  </button>
                </div>
              </section>

              <section class="analytics-panel">
                <div class="analytics-panel-heading">
                  <h3>Defects by department</h3>
                  <span id="departmentChartValue">Select a bar</span>
                </div>
                <div class="horizontal-chart department-chart" id="departmentChart">
                  <button type="button" data-label="Warehouse Operations" data-value="22">
                    <span>Warehouse Operations</span><i style="--bar: 100%"></i><b>22</b>
                  </button>
                  <button type="button" data-label="Inbound Logistics" data-value="9">
                    <span>Inbound Logistics</span><i style="--bar: 41%"></i><b>9</b>
                  </button>
                  <button type="button" data-label="Engine Assembly" data-value="6">
                    <span>Engine Assembly</span><i style="--bar: 27%"></i><b>6</b>
                  </button>
                </div>
              </section>

              <section class="analytics-panel">
                <div class="analytics-panel-heading">
                  <h3>Most defective racks</h3>
                  <span id="rackChartValue">Select a rack</span>
                </div>
                <div class="rack-ranking" id="rackRanking">
                  <button type="button" data-label="RACK-C7 - Aisle C Row 7" data-value="5 defects">
                    <span class="rank-dot red"></span><strong>RACK-C7 - Aisle C Row 7</strong><small>Building C - Zone 3</small><b>5</b>
                  </button>
                  <button type="button" data-label="RACK-A2 - Aisle A Row 2" data-value="4 defects">
                    <span class="rank-dot red"></span><strong>RACK-A2 - Aisle A Row 2</strong><small>Building A - Zone 1</small><b>4</b>
                  </button>
                  <button type="button" data-label="RACK-F4 - Aisle F Row 4" data-value="3 defects">
                    <span class="rank-dot yellow"></span><strong>RACK-F4 - Aisle F Row 4</strong><small>Building F - Zone 2</small><b>3</b>
                  </button>
                </div>
              </section>
            </div>

            <div class="analytics-lower-grid">
              <section class="analytics-panel">
                <div class="analytics-panel-heading">
                  <h3>Defect trend</h3>
                  <div class="range-toggle">
                    <button type="button" data-range="3">3 months</button>
                    <button type="button" class="active" data-range="6">6 months</button>
                  </div>
                </div>
                <div class="trend-chart" id="trendChart"></div>
              </section>

              <section class="analytics-panel heatmap-panel">
                <div class="analytics-panel-heading">
                  <h3>Inspection compliance heatmap</h3>
                  <span id="heatmapValue">Select a cell</span>
                </div>
                <div class="heatmap" id="heatmap"></div>
                <div class="heatmap-legend">
                  <span><i class="low"></i>Low (1-3)</span>
                  <span><i class="moderate"></i>Moderate (4-6)</span>
                  <span><i class="high"></i>High (7-9)</span>
                  <span><i class="critical"></i>Critical (10+)</span>
                </div>
              </section>
            </div>
          </div>
        </details>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-manager-view-image]").forEach((button) => {
    button.addEventListener("click", () => openImageViewer(button.dataset.managerViewImage));
  });
  document.querySelectorAll("[data-manager-proceed]").forEach((button) => {
    button.addEventListener("click", () => openManagerReportReview(button.dataset.managerProceed));
  });
  document.querySelectorAll("[data-edit-maintenance]").forEach((button) => {
    button.addEventListener("click", () => editMaintenanceReport(button.dataset.editMaintenance));
  });
  initializeAnalyticsInteractions();
}

function initializeAnalyticsInteractions() {
  const trendData = [
    { month: "Jan", value: 6 },
    { month: "Feb", value: 7 },
    { month: "Mar", value: 11 },
    { month: "Apr", value: 9 },
    { month: "May", value: 14 },
    { month: "Jun", value: 17 }
  ];
  const heatmapData = {
    "Building A - Zone 1": [2, 3, 5, 4, 7, 8],
    "Building C - Zone 3": [3, 4, 6, 5, 9, 11],
    "Building F - Zone 2": [1, 2, 3, 4, 4, 5]
  };
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  function bindChartSelection(containerSelector, outputSelector) {
    const container = document.querySelector(containerSelector);
    const output = document.querySelector(outputSelector);
    if (!container || !output) return;

    container.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        container.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        output.textContent = `${button.dataset.label}: ${button.dataset.value}`;
      });
    });
  }

  function renderTrend(range) {
    const chart = document.querySelector("#trendChart");
    if (!chart) return;
    const data = trendData.slice(-range);
    const max = Math.max(...data.map((item) => item.value));

    chart.innerHTML = data.map((item) => `
      <button type="button" data-month="${item.month}" data-value="${item.value}" style="--height: ${(item.value / max) * 100}%">
        <span>${item.value}</span>
        <i></i>
        <small>${item.month}</small>
      </button>
    `).join("");

    chart.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        chart.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
      });
    });
  }

  function heatClass(value) {
    if (value >= 10) return "critical";
    if (value >= 7) return "high";
    if (value >= 4) return "moderate";
    return "low";
  }

  function renderHeatmap() {
    const heatmap = document.querySelector("#heatmap");
    const output = document.querySelector("#heatmapValue");
    if (!heatmap || !output) return;

    heatmap.innerHTML = `
      <div class="heatmap-row heatmap-header">
        <strong>Location</strong>
        ${months.map((month) => `<span>${month}</span>`).join("")}
      </div>
      ${Object.entries(heatmapData).map(([building, values]) => `
        <div class="heatmap-row">
          <strong>${building}</strong>
          ${values.map((value, index) => `
            <button type="button" class="${heatClass(value)}" data-building="${building}" data-month="${months[index]}" data-value="${value}">
              ${value}
            </button>
          `).join("")}
        </div>
      `).join("")}
    `;

    heatmap.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        heatmap.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        output.textContent = `${button.dataset.building}, ${button.dataset.month}: ${button.dataset.value} defects`;
      });
    });
  }

  bindChartSelection("#buildingChart", "#buildingChartValue");
  bindChartSelection("#departmentChart", "#departmentChartValue");
  bindChartSelection("#rackRanking", "#rackChartValue");

  document.querySelectorAll("[data-range]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-range]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderTrend(Number(button.dataset.range));
    });
  });

  renderTrend(6);
  renderHeatmap();
}

function renderSafetyWorkspace() {
  const reportsMarkup = maintenanceReports.length
    ? maintenanceReports.map((report) => `
        <article class="report-card">
          <div>
            <strong>${report.rack} - ${report.department} - ${report.building}</strong>
            <span>${maintenanceStatusFor(report, "safety")}</span>
          </div>
          <div class="report-actions safety-actions">
            <button type="button" data-safety-image="${report.id}">View image</button>
            <button type="button" data-safety-inspection="${report.id}">Inspection report</button>
            <button type="button" data-safety-edit="${report.id}">Edit</button>
          </div>
        </article>
      `).join("")
    : `<p class="empty-state">Nothing yet.</p>`;

  workspaceBody.innerHTML = `
    <div class="role-page">
      <div class="role-heading">
        <p>Safety Representative</p>
        <h2>Safety representative workspace</h2>
      </div>

      <div class="accordion-list">
        <details class="accordion-panel" open>
          <summary>
            <span>Reports</span>
            <small>${maintenanceReports.length} report(s)</small>
          </summary>
          <div class="failed-reports">
            ${reportsMarkup}
          </div>
        </details>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-safety-image]").forEach((button) => {
    button.addEventListener("click", () => openMaintenanceSourceImage(button.dataset.safetyImage));
  });
  document.querySelectorAll("[data-safety-inspection]").forEach((button) => {
    button.addEventListener("click", () => openMaintenanceSourceInspection(button.dataset.safetyInspection));
  });
  document.querySelectorAll("[data-safety-edit]").forEach((button) => {
    button.addEventListener("click", () => editMaintenanceReport(button.dataset.safetyEdit, "safety"));
  });
}

function renderMaintenanceWorkspace() {
  const readyReports = maintenanceReports.filter((report) => isMaintenanceFinalized(report) && !report.assignmentId);
  const reportsMarkup = readyReports.length
    ? readyReports.map((report) => `
        <article class="report-card">
          <div>
            <strong>${report.rack} - ${report.department} - ${report.building}</strong>
            <span>${maintenanceStatusFor(report, "organizer")}</span>
          </div>
          <div class="report-actions safety-actions">
            <button type="button" data-organizer-image="${report.id}">View image</button>
            <button type="button" data-organizer-inspection="${report.id}">Inspection report</button>
            <button type="button" data-organizer-maintenance="${report.id}">Maintenance report</button>
          </div>
        </article>
      `).join("")
    : `<p class="empty-state">Nothing yet.</p>`;

  const assignmentsMarkup = assignments.length
    ? assignments.map((assignment) => `
        <article class="assignment-card">
          <div class="assignment-card-header">
            <div>
              <strong>${assignment.rack} - ${assignment.department} - ${assignment.building}</strong>
              <span>${assignment.status}</span>
            </div>
            <button type="button" data-edit-assignment="${assignment.id}">Edit</button>
          </div>

          <details class="notification-panel">
            <summary>
              <span>Notifications</span>
              <small>${assignment.notifications.length} sent</small>
            </summary>
            <div class="notification-content">
              <div class="notification-toolbar">
                <span>Sent notifications</span>
                <button type="button" data-new-notification="${assignment.id}">New notification</button>
              </div>
              <div class="notification-list">
                ${assignment.notifications.length
                  ? assignment.notifications.map((notification, index) => `
                      <div class="notification-row">
                        <span>Notification ${index + 1}</span>
                        <button type="button" data-view-notification="${assignment.id}" data-notification-index="${index}">View</button>
                      </div>
                    `).join("")
                  : `<p class="empty-state">Nothing yet.</p>`}
              </div>
            </div>
          </details>
        </article>
      `).join("")
    : `<p class="empty-state">Nothing yet.</p>`;

  workspaceBody.innerHTML = `
    <div class="role-page">
      <div class="role-heading">
        <p>Maintenance Organizer</p>
        <h2>Maintenance organizer workspace</h2>
      </div>

      <div class="accordion-list">
        <details class="accordion-panel" open>
          <summary>
            <span>Reports</span>
            <small>${readyReports.length} report(s)</small>
          </summary>
          <div class="failed-reports">
            ${reportsMarkup}
          </div>
        </details>

        <details class="accordion-panel">
          <summary>
            <span>Assignments</span>
            <small>${assignments.length} assignment(s)</small>
          </summary>
          <div class="assignments-list">
            ${assignmentsMarkup}
          </div>
        </details>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-organizer-image]").forEach((button) => {
    button.addEventListener("click", () => openMaintenanceSourceImage(button.dataset.organizerImage));
  });
  document.querySelectorAll("[data-organizer-inspection]").forEach((button) => {
    button.addEventListener("click", () => openMaintenanceSourceInspection(button.dataset.organizerInspection));
  });
  document.querySelectorAll("[data-organizer-maintenance]").forEach((button) => {
    button.addEventListener("click", () => openOrganizerMaintenance(button.dataset.organizerMaintenance));
  });
  document.querySelectorAll("[data-edit-assignment]").forEach((button) => {
    button.addEventListener("click", () => openAssignmentEditor(button.dataset.editAssignment));
  });
  document.querySelectorAll("[data-new-notification]").forEach((button) => {
    button.addEventListener("click", () => openNotificationComposer(button.dataset.newNotification));
  });
  document.querySelectorAll("[data-view-notification]").forEach((button) => {
    button.addEventListener("click", () => {
      openNotificationViewer(button.dataset.viewNotification, Number(button.dataset.notificationIndex));
    });
  });
}

function showLoggedIn(user) {
  if (user.role === "Inspector") {
    renderInspectorWorkspace();
  } else if (user.role === "Manager") {
    renderManagerWorkspace();
  } else if (user.role === "Safety Representative") {
    renderSafetyWorkspace();
  } else if (user.role === "Maintenance Organizer") {
    renderMaintenanceWorkspace();
  } else {
    workspaceBody.innerHTML = `
      <p>${user.role}</p>
      <h2>Logged in</h2>
      <p>${user.message}</p>
    `;
  }

  loginView.classList.add("is-hidden");
  loggedInView.classList.remove("is-hidden");
  document.body.classList.add("session-active");
}

function showLogin() {
  loginForm.reset();
  errorMessage.textContent = "";
  loggedInView.classList.add("is-hidden");
  loginView.classList.remove("is-hidden");
  document.body.classList.remove("session-active");
  usernameInput.focus();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const user = USERS[username];

  if (!user || user.password !== password) {
    errorMessage.textContent = "Invalid username or password.";
    return;
  }

  showLoggedIn(user);
});

logoutButton.addEventListener("click", showLogin);

function resetIssueForm() {
  departmentSelect.value = "";
  zoneSelect.value = "";
  rackSelect.value = "";
  rackImageInput.value = "";
  fileName.textContent = "No image selected";
  dropZone.classList.remove("has-file");
  duplicateAlert.classList.add("is-hidden");
  duplicateAlertKey = "";
  updateIssueForm();
}

function openIssueModal() {
  resetIssueForm();
  showIntakeStep();
  issueModal.classList.remove("is-hidden");
  issueModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  issueModal.classList.add("is-hidden");
  issueModal.setAttribute("aria-hidden", "true");
  issueModal.querySelector(".issue-modal").classList.remove("protocol-mode");
}

function showIntakeStep() {
  modalContent.classList.remove("is-hidden");
  analysisContent.classList.add("is-hidden");
  classificationContent.classList.add("is-hidden");
  protocolContent.classList.add("is-hidden");
  backIssueButton.classList.add("is-hidden");
  cancelIssueModal.classList.remove("is-hidden");
  nextIssueButton.textContent = "Next";
  protocolError.textContent = "";
  issueModal.querySelector(".issue-modal").classList.remove("protocol-mode");
  updateIssueForm();
}

function showAnalysisStep() {
  modalContent.classList.add("is-hidden");
  analysisContent.classList.remove("is-hidden");
  classificationContent.classList.add("is-hidden");
  protocolContent.classList.add("is-hidden");
  backIssueButton.classList.remove("is-hidden");
  cancelIssueModal.classList.add("is-hidden");
  nextIssueButton.disabled = false;
  nextIssueButton.textContent = "Next";
  issueModal.querySelector(".issue-modal").classList.remove("protocol-mode");
}

function showClassificationStep() {
  modalContent.classList.add("is-hidden");
  analysisContent.classList.add("is-hidden");
  classificationContent.classList.remove("is-hidden");
  protocolContent.classList.add("is-hidden");
  backIssueButton.classList.remove("is-hidden");
  cancelIssueModal.classList.add("is-hidden");
  nextIssueButton.disabled = false;
  nextIssueButton.textContent = "Next";
  issueModal.querySelector(".issue-modal").classList.remove("protocol-mode");
  updateSeveritySummary();
}

function showProtocolStep() {
  modalContent.classList.add("is-hidden");
  analysisContent.classList.add("is-hidden");
  classificationContent.classList.add("is-hidden");
  protocolContent.classList.remove("is-hidden");
  backIssueButton.classList.remove("is-hidden");
  cancelIssueModal.classList.add("is-hidden");
  nextIssueButton.disabled = false;
  nextIssueButton.textContent = "Submit";
  protocolError.textContent = "";
  issueModal.querySelector(".issue-modal").classList.add("protocol-mode");
  fillProtocolValues();
}

function getCurrentStep() {
  if (!modalContent.classList.contains("is-hidden")) return "intake";
  if (!analysisContent.classList.contains("is-hidden")) return "analysis";
  if (!classificationContent.classList.contains("is-hidden")) return "classification";
  return "protocol";
}

function updateSeveritySummary() {
  const selected = [...document.querySelectorAll("[data-issue-card] .severity-selector .selected")];
  const counts = { red: 0, yellow: 0, green: 0 };

  selected.forEach((button) => {
    counts[button.dataset.severity] += 1;
  });

  redCount.textContent = counts.red;
  yellowCount.textContent = counts.yellow;
  greenCount.textContent = counts.green;
  totalCount.textContent = selected.length;
}

function formattedToday() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());
}

function setProtocolAssessment(name, severity) {
  const radio = document.querySelector(`input[name="${name}"][value="${severity}"]`);
  if (!radio) return;

  radio.checked = true;
  const row = radio.closest(".protocol-row");
  const scoreInput = row.querySelector(".score-input");
  const scoreBySeverity = { green: "1", yellow: "2", red: "3" };
  scoreInput.value = scoreBySeverity[severity];
}

function selectedSeverityByIssue(index) {
  const card = document.querySelectorAll("[data-issue-card]")[index];
  return card.querySelector(".severity-selector .selected").dataset.severity;
}

function fillProtocolValues() {
  protocolDate.value = formattedToday();
  protocolLocation.value = departmentSelect.value || "Warehouse Operations";
  protocolBuilding.value = zoneSelect.value || "Building C - Zone 3";
  protocolItemNumber.value = rackSelect.value || "RACK-C7 - Aisle C Row 7";

  const bentColumn = selectedSeverityByIssue(0);
  const beamImpact = selectedSeverityByIssue(1);
  const lockingPin = selectedSeverityByIssue(2);
  const floorCrack = selectedSeverityByIssue(3);
  const loadSign = selectedSeverityByIssue(4);
  const beamSeverity = bentColumn === "red" || lockingPin === "red" ? "red" : lockingPin;

  setProtocolAssessment("floorStatus", floorCrack);
  setProtocolAssessment("collisionStatus", beamImpact);
  setProtocolAssessment("beamStatus", beamSeverity);
  setProtocolAssessment("signStatus", loadSign);
}

function validateProtocol() {
  const requiredFields = [...protocolContent.querySelectorAll("input[required], select[required], textarea[required]")];
  const emptyField = requiredFields.find((field) => !field.value.trim());

  if (emptyField) {
    emptyField.focus();
    protocolError.textContent = "Please complete all required protocol fields before submitting.";
    return false;
  }

  const radioGroups = ["floorStatus", "collisionStatus", "beamStatus", "pullOutStatus", "halfPalletStatus", "signStatus", "lightingStatus", "aisleStatus"];
  const missingRadio = radioGroups.find((group) => !protocolContent.querySelector(`input[name="${group}"]:checked`));

  if (missingRadio) {
    protocolError.textContent = "Please select an assessment for every inspection point before submitting.";
    return false;
  }

  protocolError.textContent = "";
  return true;
}

function selectedText(select) {
  return select.options[select.selectedIndex]?.textContent || "";
}

function currentRackKey() {
  return `${departmentSelect.value}||${zoneSelect.value}||${rackSelect.value}`;
}

function findOpenReportForCurrentRack() {
  const key = currentRackKey();
  return submittedReports.find((report) => report.key === key && report.status.toLowerCase() !== "fixed");
}

function scoreByStatus(groupName) {
  const selected = protocolContent.querySelector(`input[name="${groupName}"]:checked`);
  return selected ? { green: "1", yellow: "2", red: "3" }[selected.value] : "";
}

function protocolTextArea(index) {
  return protocolContent.querySelectorAll("textarea")[index].value;
}

function protocolReportHtml() {
  const documentClone = protocolContent.querySelector(".protocol-document").cloneNode(true);
  const errorMessage = documentClone.querySelector(".protocol-error");

  if (errorMessage) {
    errorMessage.remove();
  }

  documentClone.classList.add("readonly-protocol");

  documentClone.querySelectorAll("input").forEach((input) => {
    if (input.type === "radio") {
      if (input.checked) {
        input.setAttribute("checked", "checked");
      } else {
        input.removeAttribute("checked");
      }
      input.disabled = true;
      return;
    }

    input.setAttribute("value", input.value);
    input.readOnly = true;
  });

  documentClone.querySelectorAll("textarea").forEach((textarea) => {
    textarea.textContent = textarea.value;
    textarea.readOnly = true;
  });

  documentClone.querySelectorAll("select").forEach((select) => {
    [...select.options].forEach((option) => {
      if (option.selected) {
        option.setAttribute("selected", "selected");
      } else {
        option.removeAttribute("selected");
      }
    });
    select.disabled = true;
  });

  return documentClone.outerHTML;
}

function submitProtocol() {
  const imageFile = rackImageInput.files[0];
  const report = {
    id: `report-${Date.now()}`,
    key: currentRackKey(),
    title: `${selectedText(rackSelect)} - ${selectedText(zoneSelect)}`,
    department: selectedText(departmentSelect),
    building: selectedText(zoneSelect),
    rack: selectedText(rackSelect),
    status: "Awaiting manager review",
    imageName: imageFile?.name || "Submitted rack image",
    imageUrl: imageFile ? URL.createObjectURL(imageFile) : "",
    reportHtml: protocolReportHtml()
  };

  submittedReports.unshift(report);
  closeModal();
  renderInspectorWorkspace();
}

function updateIssueForm() {
  const hasRackIdentity = departmentSelect.value && zoneSelect.value && rackSelect.value;
  overdueAlert.classList.toggle("is-hidden", !hasRackIdentity);
  scheduleSection.classList.toggle("is-hidden", !hasRackIdentity);
  uploadSection.classList.toggle("is-hidden", !hasRackIdentity);
  duplicateAlert.classList.add("is-hidden");

  if (hasRackIdentity) {
    const duplicate = findOpenReportForCurrentRack();
    if (duplicate) {
      duplicateAlert.classList.remove("is-hidden");
      if (duplicateAlertKey !== duplicate.key) {
        window.alert("Issue already noted for the same rack.");
        duplicateAlertKey = duplicate.key;
      }
    }
  }

  nextIssueButton.disabled = !(hasRackIdentity && rackImageInput.files.length > 0);
}

function setFileName(files) {
  if (!files.length) {
    fileName.textContent = "No image selected";
    dropZone.classList.remove("has-file");
    return;
  }

  fileName.textContent = files[0].name;
  dropZone.classList.add("has-file");
}

function openImageViewer(reportId) {
  const report = submittedReports.find((item) => item.id === reportId);
  if (!report) return;

  viewerTitle.textContent = "Submitted image";
  viewerContent.innerHTML = report.imageUrl
    ? `<figure class="image-preview"><img src="${report.imageUrl}" alt="${report.imageName}"><figcaption>${report.imageName}</figcaption></figure>`
    : `<p class="empty-state">No submitted image available.</p>`;
  viewerLayer.classList.remove("is-hidden");
  viewerLayer.setAttribute("aria-hidden", "false");
}

function openReportViewer(reportId) {
  const report = submittedReports.find((item) => item.id === reportId);
  if (!report) return;

  viewerTitle.textContent = report.title;
  viewerContent.innerHTML = report.reportHtml;
  viewerLayer.classList.remove("is-hidden");
  viewerLayer.setAttribute("aria-hidden", "false");
}

function openManagerReportReview(reportId) {
  const report = submittedReports.find((item) => item.id === reportId);
  if (!report) return;

  viewerTitle.textContent = report.title;
  viewerContent.innerHTML = `
    ${report.reportHtml}
    <div class="viewer-actions">
      <button type="button" id="proceedMaintenanceButton">Proceed with maintenance report</button>
    </div>
  `;
  enableManagerInspectionTableEdit();
  viewerLayer.classList.remove("is-hidden");
  viewerLayer.setAttribute("aria-hidden", "false");
  document.querySelector("#proceedMaintenanceButton").addEventListener("click", () => showMaintenanceReport(report.id, null, "manager"));
}

function enableManagerInspectionTableEdit() {
  const table = viewerContent.querySelector(".protocol-table");
  if (!table) return;

  table.querySelectorAll("input, textarea").forEach((field) => {
    field.disabled = false;
    field.readOnly = false;
    field.removeAttribute("disabled");
    field.removeAttribute("readonly");
  });
}

function showMaintenanceReport(reportId, maintenanceId = null, actor = "manager") {
  const report = submittedReports.find((item) => item.id === reportId);
  if (!report) return;
  const existingForIssue = maintenanceReports.find((item) => item.sourceReportId === reportId);

  if (!maintenanceId && existingForIssue) {
    window.alert("A maintenance report already exists for this inspection issue.");
    return;
  }

  const existing = maintenanceId ? maintenanceReports.find((item) => item.id === maintenanceId) : null;
  const formValues = existing || {
    reportCode: `MR-${Date.now()}`,
    priority: "High",
    workflowStatus: "Draft",
    department: report.department,
    building: report.building,
    rack: report.rack,
    inspector: "inspector1",
    requestedBy: "manager1",
    targetCompletion: "Within 5 working days",
    scope: "Inspect upright column, collision protection, beam locking pins, permitted load sign and floor condition. Cordon off affected bay until repair decision is complete.",
    action: "Replace damaged collision protection, verify upright column integrity, replace missing locking pin, reposition permitted load sign and document final reinspection before returning rack to service."
  };

  viewerTitle.textContent = "Maintenance report";
  viewerContent.innerHTML = `
    <form class="maintenance-form" id="maintenanceForm">
      <div class="maintenance-title">
        <p>Maintenance request</p>
        <h3>Rack repair and safety action report</h3>
      </div>

      <div class="protocol-grid three">
        <label>
          Report ID
          <input id="maintenanceReportCode" value="${formValues.reportCode}" required>
        </label>
        <label>
          Priority
          <select id="maintenancePriority" required>
            <option ${formValues.priority === "High" ? "selected" : ""}>High</option>
            <option ${formValues.priority === "Medium" ? "selected" : ""}>Medium</option>
            <option ${formValues.priority === "Low" ? "selected" : ""}>Low</option>
          </select>
        </label>
        <label>
          Status
          <input id="maintenanceWorkflowStatus" value="${formValues.workflowStatus}" required>
        </label>
      </div>

      <div class="protocol-grid three">
        <label>
          Department
          <input id="maintenanceDepartment" value="${formValues.department}" required>
        </label>
        <label>
          Building / Zone
          <input id="maintenanceBuilding" value="${formValues.building}" required>
        </label>
        <label>
          Rack / Item number
          <input id="maintenanceRack" value="${formValues.rack}" required>
        </label>
      </div>

      <div class="protocol-grid three">
        <label>
          Inspector
          <input id="maintenanceInspector" value="${formValues.inspector}" required>
        </label>
        <label>
          Requested by
          <input id="maintenanceRequestedBy" value="${formValues.requestedBy}" required>
        </label>
        <label>
          Target completion
          <input id="maintenanceTargetCompletion" value="${formValues.targetCompletion}" required>
        </label>
      </div>

      <label class="wide-field">
        Maintenance scope
        <textarea id="maintenanceScope" required>${formValues.scope}</textarea>
      </label>

      <label class="wide-field">
        Recommended action
        <textarea id="maintenanceAction" required>${formValues.action}</textarea>
      </label>

      <div class="viewer-actions">
        <button type="button" class="secondary-action" id="saveMaintenanceButton">Save</button>
        <button type="button" id="submitMaintenanceButton">Submit</button>
      </div>
    </form>
  `;

  document.querySelector("#saveMaintenanceButton").addEventListener("click", () => storeMaintenanceReport(report.id, "saved", maintenanceId, actor));
  document.querySelector("#submitMaintenanceButton").addEventListener("click", () => storeMaintenanceReport(report.id, "submitted", maintenanceId, actor));

  if (existing && isMaintenanceFinalized(existing)) {
    lockMaintenanceForm();
  }
}

function storeMaintenanceReport(reportId, action, maintenanceId = null, actor = "manager") {
  const form = document.querySelector("#maintenanceForm");
  const fields = [...form.querySelectorAll("input[required], select[required], textarea[required]")];
  const emptyField = fields.find((field) => !field.value.trim());

  if (emptyField) {
    emptyField.focus();
    return;
  }

  const sourceReport = submittedReports.find((item) => item.id === reportId);
  if (!sourceReport) return;
  const existing = maintenanceId ? maintenanceReports.find((item) => item.id === maintenanceId) : null;
  const maintenanceRecord = {
    id: existing?.id || `maintenance-${Date.now()}`,
    sourceReportId: reportId,
    reportCode: document.querySelector("#maintenanceReportCode").value,
    priority: document.querySelector("#maintenancePriority").value,
    workflowStatus: document.querySelector("#maintenanceWorkflowStatus").value,
    rack: document.querySelector("#maintenanceRack").value,
    department: document.querySelector("#maintenanceDepartment").value,
    building: document.querySelector("#maintenanceBuilding").value,
    inspector: document.querySelector("#maintenanceInspector").value,
    requestedBy: document.querySelector("#maintenanceRequestedBy").value,
    targetCompletion: document.querySelector("#maintenanceTargetCompletion").value,
    scope: document.querySelector("#maintenanceScope").value,
    action: document.querySelector("#maintenanceAction").value,
    status: action === "submitted" ? "Submitted by you" : "Saved",
    managerStatus: existing?.managerStatus || "",
    safetyStatus: existing?.safetyStatus || "",
    editHistory: existing?.editHistory || {}
  };

  const actorId = actor === "safety" ? "safetyrep1" : "manager1";
  maintenanceRecord.editHistory[actorId] = new Date().toISOString();

  if (actor === "safety") {
    maintenanceRecord.safetyStatus = action === "submitted" ? "submitted" : "reviewed";
  } else {
    maintenanceRecord.managerStatus = action === "submitted" ? "submitted" : "saved";
  }

  if (existing) {
    Object.assign(existing, maintenanceRecord);
  } else {
    maintenanceReports.unshift(maintenanceRecord);
  }

  sourceReport.status = sharedWorkflowStatus(maintenanceRecord);

  closeReportViewer();
  if (actor === "safety") {
    renderSafetyWorkspace();
  } else {
    renderManagerWorkspace();
  }
}

function editMaintenanceReport(maintenanceId, actor = "manager") {
  const report = maintenanceReports.find((item) => item.id === maintenanceId);
  if (!report) return;

  alertOtherEditor(report, actor);
  viewerLayer.classList.remove("is-hidden");
  viewerLayer.setAttribute("aria-hidden", "false");
  showMaintenanceReport(report.sourceReportId, maintenanceId, actor);
}

function maintenanceStatusFor(report, viewer) {
  if (report.assignmentStatus) return report.assignmentStatus;

  const sharedStatus = sharedWorkflowStatus(report);
  if (sharedStatus.startsWith("Submitted")) return sharedStatus;

  const managerTime = report.editHistory?.manager1 ? new Date(report.editHistory.manager1).getTime() : 0;
  const safetyTime = report.editHistory?.safetyrep1 ? new Date(report.editHistory.safetyrep1).getTime() : 0;
  const lastActor = safetyTime > managerTime ? "safety" : "manager";

  if (lastActor === "safety") {
    if (viewer === "safety") {
      return report.safetyStatus === "submitted" ? "Submitted by you" : "Reviewed";
    }
    return report.safetyStatus === "submitted"
      ? "Submitted by safety representative"
      : "Reviewed by safety representative";
  }

  if (viewer === "safety") {
    return report.managerStatus === "submitted" ? "Submitted by manager" : "Saved by manager";
  }
  return report.managerStatus === "submitted" ? "Submitted by you" : "Saved";
}

function sharedWorkflowStatus(report) {
  const managerSubmitted = report.managerStatus === "submitted";
  const safetySubmitted = report.safetyStatus === "submitted";

  if (managerSubmitted && safetySubmitted) return "Submitted";
  if (managerSubmitted) return "Submitted by manager";
  if (safetySubmitted) return "Submitted by safety representative";
  if (report.safetyStatus === "reviewed") return "Reviewed by safety representative";
  return "Reviewed";
}

function isMaintenanceFinalized(report) {
  return report.managerStatus === "submitted" && report.safetyStatus === "submitted";
}

function lockMaintenanceForm() {
  const form = document.querySelector("#maintenanceForm");
  if (!form) return;

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = true;
  });
  form.querySelectorAll(".viewer-actions button").forEach((button) => {
    button.disabled = true;
  });

  const notice = document.createElement("p");
  notice.className = "finalized-notice";
  notice.textContent = "This report has been submitted by both the manager and safety representative. Editing is locked.";
  form.querySelector(".viewer-actions").before(notice);
}

function formatEditTime(isoDate) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Stockholm"
  }).format(new Date(isoDate));
}

function alertOtherEditor(report, actor) {
  const otherActorId = actor === "safety" ? "manager1" : "safetyrep1";
  const otherActorLabel = actor === "safety" ? "Manager" : "Safety representative";
  const modifiedAt = report.editHistory?.[otherActorId];

  if (modifiedAt) {
    window.alert(`${otherActorLabel} last changed this report on ${formatEditTime(modifiedAt)}.`);
  }
}

function openMaintenanceSourceImage(maintenanceId) {
  const maintenance = maintenanceReports.find((item) => item.id === maintenanceId);
  if (!maintenance) return;
  openImageViewer(maintenance.sourceReportId);
}

function openMaintenanceSourceInspection(maintenanceId) {
  const maintenance = maintenanceReports.find((item) => item.id === maintenanceId);
  if (!maintenance) return;
  openReportViewer(maintenance.sourceReportId);
}

function maintenanceReportHtml(report) {
  return `
    <div class="maintenance-form readonly-maintenance">
      <div class="maintenance-title">
        <p>Maintenance request</p>
        <h3>Rack repair and safety action report</h3>
      </div>

      <div class="protocol-grid three">
        <label>Report ID<input value="${report.reportCode}" readonly></label>
        <label>Priority<input value="${report.priority}" readonly></label>
        <label>Status<input value="${report.workflowStatus}" readonly></label>
      </div>

      <div class="protocol-grid three">
        <label>Department<input value="${report.department}" readonly></label>
        <label>Building / Zone<input value="${report.building}" readonly></label>
        <label>Rack / Item number<input value="${report.rack}" readonly></label>
      </div>

      <div class="protocol-grid three">
        <label>Inspector<input value="${report.inspector}" readonly></label>
        <label>Requested by<input value="${report.requestedBy}" readonly></label>
        <label>Target completion<input value="${report.targetCompletion}" readonly></label>
      </div>

      <label class="wide-field">Maintenance scope<textarea readonly>${report.scope}</textarea></label>
      <label class="wide-field">Recommended action<textarea readonly>${report.action}</textarea></label>
    </div>
  `;
}

function openOrganizerMaintenance(maintenanceId) {
  const report = maintenanceReports.find((item) => item.id === maintenanceId);
  if (!report) return;

  viewerTitle.textContent = `${report.rack} - ${report.department} - ${report.building}`;
  viewerContent.innerHTML = `
    ${maintenanceReportHtml(report)}
    <div class="viewer-actions">
      <button type="button" id="assignFixButton">Assign fix</button>
    </div>
  `;
  viewerLayer.classList.remove("is-hidden");
  viewerLayer.setAttribute("aria-hidden", "false");
  document.querySelector("#assignFixButton").addEventListener("click", () => openAssignmentForm(maintenanceId));
}

function assignmentFormHtml(report, assignment = null) {
  const isEditing = Boolean(assignment);
  const values = assignment || {
    contractor: "",
    status: "assigned"
  };

  return `
    <form class="maintenance-form" id="assignmentForm">
      <div class="maintenance-title">
        <p>Work assignment</p>
        <h3>Assignment report</h3>
      </div>

      <div class="protocol-grid three">
        <label>Inspector<input value="Inspector1" readonly></label>
        <label>Manager<input value="Manager1" readonly></label>
        <label>Safety Representative<input value="Safety Rep1" readonly></label>
      </div>

      <div class="protocol-grid three">
        <label>Department<input value="${report.department}" readonly></label>
        <label>Building / Zone<input value="${report.building}" readonly></label>
        <label>Rack<input value="${report.rack}" readonly></label>
      </div>

      <div class="protocol-grid two">
        <label>
          Contractor
          <input id="assignmentContractor" type="email" value="${values.contractor}" ${isEditing ? "readonly" : ""} required>
        </label>
        <label>
          Status
          <select id="assignmentStatus" required>
            <option value="assigned" ${values.status === "assigned" ? "selected" : ""}>assigned</option>
            <option value="acknowledged" ${values.status === "acknowledged" ? "selected" : ""}>acknowledged</option>
            <option value="started" ${values.status === "started" ? "selected" : ""}>started</option>
            <option value="fixed" ${values.status === "fixed" ? "selected" : ""}>fixed</option>
          </select>
        </label>
      </div>

      <p class="protocol-error" id="assignmentError"></p>

      ${isEditing ? `
        <div class="assignment-view-links">
          <button type="button" class="secondary-action" id="assignmentViewImage">View image</button>
          <button type="button" class="secondary-action" id="assignmentViewInspection">View inspection report</button>
          <button type="button" class="secondary-action" id="assignmentViewMaintenance">View maintenance report</button>
        </div>
      ` : ""}

      <div class="viewer-actions">
        <button type="button" id="${isEditing ? "updateAssignmentButton" : "createAssignmentButton"}">
          ${isEditing ? "Update" : "Assign"}
        </button>
      </div>
    </form>
  `;
}

function openAssignmentForm(maintenanceId) {
  const report = maintenanceReports.find((item) => item.id === maintenanceId);
  if (!report) return;

  viewerTitle.textContent = "Assignment report";
  viewerContent.innerHTML = assignmentFormHtml(report);
  document.querySelector("#createAssignmentButton").addEventListener("click", () => createAssignment(maintenanceId));
}

function createAssignment(maintenanceId) {
  const report = maintenanceReports.find((item) => item.id === maintenanceId);
  const contractor = document.querySelector("#assignmentContractor");
  const status = document.querySelector("#assignmentStatus");
  const error = document.querySelector("#assignmentError");

  if (!contractor.value.trim() || !contractor.checkValidity() || !status.value) {
    error.textContent = "Enter a valid contractor email and select a status.";
    contractor.focus();
    return;
  }

  const assignment = {
    id: `assignment-${Date.now()}`,
    maintenanceId,
    sourceReportId: report.sourceReportId,
    department: report.department,
    building: report.building,
    rack: report.rack,
    contractor: contractor.value.trim(),
    status: status.value,
    notifications: []
  };

  assignments.unshift(assignment);
  report.assignmentId = assignment.id;
  applyAssignmentStatus(assignment);
  window.alert("Contractor assigned!");
  closeReportViewer();
  renderMaintenanceWorkspace();
}

function openAssignmentEditor(assignmentId) {
  const assignment = assignments.find((item) => item.id === assignmentId);
  const report = maintenanceReports.find((item) => item.id === assignment?.maintenanceId);
  if (!assignment || !report) return;

  viewerTitle.textContent = `${assignment.rack} - ${assignment.department} - ${assignment.building}`;
  viewerContent.innerHTML = assignmentFormHtml(report, assignment);
  viewerLayer.classList.remove("is-hidden");
  viewerLayer.setAttribute("aria-hidden", "false");

  document.querySelector("#updateAssignmentButton").addEventListener("click", () => updateAssignment(assignmentId));
  document.querySelector("#assignmentViewImage").addEventListener("click", () => openImageInNewTab(assignment.sourceReportId));
  document.querySelector("#assignmentViewInspection").addEventListener("click", () => openInspectionInNewTab(assignment.sourceReportId));
  document.querySelector("#assignmentViewMaintenance").addEventListener("click", () => openMaintenanceInNewTab(assignment.maintenanceId));
}

function updateAssignment(assignmentId) {
  const assignment = assignments.find((item) => item.id === assignmentId);
  if (!assignment) return;

  assignment.status = document.querySelector("#assignmentStatus").value;
  applyAssignmentStatus(assignment);
  closeReportViewer();
  renderMaintenanceWorkspace();
}

function applyAssignmentStatus(assignment) {
  const maintenance = maintenanceReports.find((item) => item.id === assignment.maintenanceId);
  const inspection = submittedReports.find((item) => item.id === assignment.sourceReportId);
  if (maintenance) maintenance.assignmentStatus = assignment.status;
  if (inspection) inspection.status = assignment.status;
}

function openContentInNewTab(title, html) {
  const tab = window.open("", "_blank");
  if (!tab) {
    window.alert("Please allow popups to open this report in a new tab.");
    return;
  }

  tab.document.write(`<!doctype html><html><head><title>${title}</title><link rel="stylesheet" href="styles.css"></head><body><main class="standalone-report">${html}</main></body></html>`);
  tab.document.close();
}

function openImageInNewTab(sourceReportId) {
  const report = submittedReports.find((item) => item.id === sourceReportId);
  if (!report?.imageUrl) return;
  window.open(report.imageUrl, "_blank");
}

function openInspectionInNewTab(sourceReportId) {
  const report = submittedReports.find((item) => item.id === sourceReportId);
  if (!report) return;
  openContentInNewTab("Inspection report", report.reportHtml);
}

function openMaintenanceInNewTab(maintenanceId) {
  const report = maintenanceReports.find((item) => item.id === maintenanceId);
  if (!report) return;
  openContentInNewTab("Maintenance report", maintenanceReportHtml(report));
}

function openNotificationComposer(assignmentId) {
  viewerTitle.textContent = "New notification";
  viewerContent.innerHTML = `
    <form class="notification-form" id="notificationForm">
      <label>
        To
        <textarea id="notificationTo" placeholder="contractor@example.com, manager@example.com" required></textarea>
      </label>
      <label>
        Message
        <textarea id="notificationMessage" placeholder="Write notification message" required></textarea>
      </label>
      <p class="protocol-error" id="notificationError"></p>
      <div class="viewer-actions">
        <button type="button" id="sendNotificationButton">Send</button>
      </div>
    </form>
  `;
  viewerLayer.classList.remove("is-hidden");
  viewerLayer.setAttribute("aria-hidden", "false");
  document.querySelector("#sendNotificationButton").addEventListener("click", () => sendNotification(assignmentId));
}

function validEmailList(value) {
  const emails = value.split(",").map((email) => email.trim()).filter(Boolean);
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emails.length > 0 && emails.every((email) => pattern.test(email));
}

function sendNotification(assignmentId) {
  const assignment = assignments.find((item) => item.id === assignmentId);
  const to = document.querySelector("#notificationTo").value.trim();
  const message = document.querySelector("#notificationMessage").value.trim();
  const error = document.querySelector("#notificationError");

  if (!validEmailList(to) || !message) {
    error.textContent = "Enter comma-separated valid email addresses and a message.";
    return;
  }

  assignment.notifications.push({
    to,
    message,
    sentAt: new Date().toISOString()
  });
  window.alert("Emails sent!");
  closeReportViewer();
  renderMaintenanceWorkspace();
}

function openNotificationViewer(assignmentId, notificationIndex) {
  const assignment = assignments.find((item) => item.id === assignmentId);
  const notification = assignment?.notifications[notificationIndex];
  if (!notification) return;

  viewerTitle.textContent = `Notification ${notificationIndex + 1}`;
  viewerContent.innerHTML = `
    <div class="notification-form readonly-notification">
      <label>To<textarea readonly>${notification.to}</textarea></label>
      <label>Message<textarea readonly>${notification.message}</textarea></label>
    </div>
  `;
  viewerLayer.classList.remove("is-hidden");
  viewerLayer.setAttribute("aria-hidden", "false");
}

function closeReportViewer() {
  viewerLayer.classList.add("is-hidden");
  viewerLayer.setAttribute("aria-hidden", "true");
}

[departmentSelect, zoneSelect, rackSelect].forEach((select) => {
  select.addEventListener("change", updateIssueForm);
});

rackImageInput.addEventListener("change", () => {
  setFileName(rackImageInput.files);
  updateIssueForm();
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("is-dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("is-dragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("is-dragging");

  if (!event.dataTransfer.files.length) return;

  const transfer = new DataTransfer();
  transfer.items.add(event.dataTransfer.files[0]);
  rackImageInput.files = transfer.files;
  setFileName(rackImageInput.files);
  updateIssueForm();
});

closeIssueModal.addEventListener("click", closeModal);
cancelIssueModal.addEventListener("click", closeModal);
closeViewer.addEventListener("click", closeReportViewer);

backIssueButton.addEventListener("click", () => {
  const step = getCurrentStep();
  if (step === "protocol") {
    showClassificationStep();
    return;
  }

  if (step === "classification") {
    showAnalysisStep();
    return;
  }

  showIntakeStep();
});

nextIssueButton.addEventListener("click", () => {
  const step = getCurrentStep();
  if (step === "protocol") {
    if (!validateProtocol()) return;
    submitProtocol();
    return;
  }

  if (step === "classification") {
    showProtocolStep();
    return;
  }

  if (step === "analysis") {
    showClassificationStep();
    return;
  }

  showAnalysisStep();
});

document.querySelectorAll("[data-issue-card] .severity-selector button").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-issue-card]");
    const buttons = card.querySelectorAll(".severity-selector button");

    buttons.forEach((severityButton) => {
      severityButton.classList.remove("selected");
    });

    card.classList.remove("green", "yellow", "red");
    card.classList.add(button.dataset.severity);
    button.classList.add("selected");
    updateSeveritySummary();
  });
});
