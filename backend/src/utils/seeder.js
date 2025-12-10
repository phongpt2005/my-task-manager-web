/**
 * Database Seeder
 * Seeds initial data for the application
 */

const User = require('../models/User');
const Project = require('../models/Project');

// Default projects to seed
const defaultProjects = [
    {
        name: 'Công việc cá nhân',
        description: 'Các công việc cá nhân hàng ngày',
        color: '#667eea',
        icon: '📋'
    },
    {
        name: 'Dự án Web',
        description: 'Phát triển website và ứng dụng web',
        color: '#f5576c',
        icon: '🌐'
    },
    {
        name: 'Marketing',
        description: 'Các hoạt động marketing và quảng cáo',
        color: '#4facfe',
        icon: '📢'
    },
    {
        name: 'Học tập',
        description: 'Các task liên quan đến học tập, nghiên cứu',
        color: '#43e97b',
        icon: '📚'
    },
    {
        name: 'Thiết kế',
        description: 'Công việc thiết kế đồ họa, UI/UX',
        color: '#fa709a',
        icon: '🎨'
    },
    {
        name: 'Bug & Fix',
        description: 'Sửa lỗi và bảo trì hệ thống',
        color: '#f093fb',
        icon: '🐛'
    }
];

/**
 * Seed default projects for a user
 */
const seedProjectsForUser = async (userId) => {
    try {
        // Check if user already has projects
        const existingProjects = await Project.countDocuments({ createdBy: userId });

        if (existingProjects === 0) {
            console.log(`📦 Seeding default projects for user ${userId}...`);

            const projectsToCreate = defaultProjects.map(project => ({
                ...project,
                createdBy: userId,
                members: [{ user: userId, role: 'owner' }]
            }));

            await Project.insertMany(projectsToCreate);
            console.log(`✅ Created ${projectsToCreate.length} default projects`);
        }
    } catch (error) {
        console.error('Error seeding projects:', error.message);
    }
};

/**
 * Seed default projects for all existing users (run once)
 */
const seedAllProjects = async () => {
    try {
        // Get all users
        const users = await User.find({});

        for (const user of users) {
            await seedProjectsForUser(user._id);
        }
    } catch (error) {
        console.error('Error in seedAllProjects:', error.message);
    }
};

module.exports = {
    seedProjectsForUser,
    seedAllProjects,
    defaultProjects
};
