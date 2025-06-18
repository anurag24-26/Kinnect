kinnect-backend/
├── src/
│ ├── config/
│ │ ├── db.js # MongoDB connection setup
│ │ ├── cloudinary.js # (Optional) Media upload config
│ │ └── index.js # Central export for all configs
│ │
│ ├── controllers/
│ │ ├── auth.controller.js
│ │ ├── user.controller.js
│ │ ├── post.controller.js
│ │ ├── comment.controller.js
│ │ ├── follow.controller.js
│ │ └── notification.controller.js
│ │
│ ├── models/
│ │ ├── user.model.js
│ │ ├── post.model.js
│ │ ├── comment.model.js
│ │ ├── follow.model.js
│ │ └── notification.model.js
│ │
│ ├── routes/
│ │ ├── auth.routes.js
│ │ ├── user.routes.js
│ │ ├── post.routes.js
│ │ ├── comment.routes.js
│ │ ├── follow.routes.js
│ │ └── notification.routes.js
│ │
│ ├── middlewares/
│ │ ├── auth.middleware.js
│ │ ├── validate.middleware.js
│ │ ├── error.middleware.js
│ │ └── rateLimiter.middleware.js
│ │
│ ├── services/
│ │ ├── auth.service.js
│ │ ├── email.service.js
│ │ ├── notification.service.js
│ │ └── storage.service.js
│ │
│ ├── utils/
│ │ ├── token.utils.js
│ │ ├── slugify.utils.js
│ │ └── emailTemplates.js
│ │
│ ├── sockets/
│ │ ├── index.js # Init socket.io and handle events
│ │ ├── chat.socket.js
│ │ └── notification.socket.js
│ │
│ ├── jobs/
│ │ └── emailJob.js # (Optional) For queues like Bull
│ │
│ ├── uploads/
│ │ └── temp/ # Temporary storage for local uploads
│ │
│ └── index.js # Express app init + route bootstrapping
│
├── tests/
│ ├── auth.test.js
│ ├── user.test.js
│ └── post.test.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
