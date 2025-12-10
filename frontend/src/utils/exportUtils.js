/**
 * Export Utilities
 * PDF and Excel export functionality for tasks and reports
 */

// Dynamically import libraries when needed
let jsPDF;
let XLSX;

/**
 * Load jsPDF library dynamically
 */
const loadJsPDF = async () => {
    if (!jsPDF) {
        const module = await import('jspdf');
        jsPDF = module.jsPDF || module.default;
    }
    return jsPDF;
};

/**
 * Load XLSX library dynamically
 */
const loadXLSX = async () => {
    if (!XLSX) {
        XLSX = await import('xlsx');
    }
    return XLSX;
};

/**
 * Export tasks to PDF
 */
export const exportTasksToPDF = async (tasks, options = {}) => {
    const PDF = await loadJsPDF();
    const doc = new PDF();

    const { title = 'Danh sách Tasks', author = 'Task Manager' } = options;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(title, 20, 20);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`, 20, 30);

    // Table header
    let y = 45;
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(79, 70, 229);
    doc.rect(20, y - 5, 170, 10, 'F');
    doc.text('Tên Task', 25, y);
    doc.text('Trạng thái', 100, y);
    doc.text('Độ ưu tiên', 135, y);
    doc.text('Deadline', 165, y);

    // Table rows
    y += 12;
    doc.setTextColor(60, 60, 60);

    const statusLabels = {
        todo: 'Chờ làm',
        inprogress: 'Đang làm',
        review: 'Review',
        done: 'Hoàn thành'
    };

    const priorityLabels = {
        low: 'Thấp',
        medium: 'Trung bình',
        high: 'Cao',
        urgent: 'Gấp'
    };

    tasks.forEach((task, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        // Alternate row colors
        if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(20, y - 5, 170, 10, 'F');
        }

        const truncatedTitle = task.title.length > 40
            ? task.title.substring(0, 37) + '...'
            : task.title;

        doc.text(truncatedTitle, 25, y);
        doc.text(statusLabels[task.status] || task.status, 100, y);
        doc.text(priorityLabels[task.priority] || task.priority, 135, y);
        doc.text(task.deadline
            ? new Date(task.deadline).toLocaleDateString('vi-VN')
            : '-', 165, y);

        y += 10;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Tổng: ${tasks.length} tasks | ${author}`, 20, 285);

    // Save
    doc.save(`tasks_${Date.now()}.pdf`);
};

/**
 * Export tasks to Excel
 */
export const exportTasksToExcel = async (tasks, options = {}) => {
    const xlsx = await loadXLSX();
    const { filename = 'tasks', sheetName = 'Tasks' } = options;

    const statusLabels = {
        todo: 'Chờ làm',
        inprogress: 'Đang làm',
        review: 'Review',
        done: 'Hoàn thành'
    };

    const priorityLabels = {
        low: 'Thấp',
        medium: 'Trung bình',
        high: 'Cao',
        urgent: 'Gấp'
    };

    // Prepare data
    const data = tasks.map((task, index) => ({
        'STT': index + 1,
        'Tên Task': task.title,
        'Mô tả': task.description || '',
        'Trạng thái': statusLabels[task.status] || task.status,
        'Độ ưu tiên': priorityLabels[task.priority] || task.priority,
        'Dự án': task.project?.name || '-',
        'Deadline': task.deadline
            ? new Date(task.deadline).toLocaleDateString('vi-VN')
            : '-',
        'Ngày tạo': new Date(task.createdAt).toLocaleDateString('vi-VN'),
        'Người tạo': task.createdBy?.name || '-'
    }));

    // Create workbook
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 5 },   // STT
        { wch: 40 },  // Tên Task
        { wch: 50 },  // Mô tả
        { wch: 12 },  // Trạng thái
        { wch: 12 },  // Độ ưu tiên
        { wch: 15 },  // Dự án
        { wch: 12 },  // Deadline
        { wch: 12 },  // Ngày tạo
        { wch: 15 }   // Người tạo
    ];

    xlsx.utils.book_append_sheet(wb, ws, sheetName);

    // Save
    xlsx.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
};

/**
 * Export project report to PDF
 */
export const exportProjectReportPDF = async (project, tasks, members = []) => {
    const PDF = await loadJsPDF();
    const doc = new PDF();

    // Title
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229);
    doc.text(`Báo cáo dự án: ${project.name}`, 20, 25);

    // Project info
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Mô tả: ${project.description || 'Không có mô tả'}`, 20, 40);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 20, 50);

    // Stats
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const completionRate = tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text('Thống kê', 20, 70);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Tổng số tasks: ${tasks.length}`, 25, 82);
    doc.text(`Đã hoàn thành: ${completedTasks} (${completionRate}%)`, 25, 92);
    doc.text(`Đang thực hiện: ${tasks.filter(t => t.status === 'inprogress').length}`, 25, 102);
    doc.text(`Chờ làm: ${tasks.filter(t => t.status === 'todo').length}`, 25, 112);

    // Members
    if (members.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229);
        doc.text('Thành viên', 20, 135);

        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        members.forEach((member, index) => {
            doc.text(`${index + 1}. ${member.user?.name || 'Unknown'} (${member.role})`, 25, 147 + index * 10);
        });
    }

    doc.save(`project_report_${project.name}_${Date.now()}.pdf`);
};

export default {
    exportTasksToPDF,
    exportTasksToExcel,
    exportProjectReportPDF
};
