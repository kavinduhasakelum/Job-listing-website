import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("🔑 verifyToken - Path:", req.path, "| Has auth header:", !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("❌ No token provided");
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Will contain { id, role }
        console.log("✅ Token verified - User ID:", decoded.id, "Role:", decoded.role);
        next();
    } catch (err) {
        console.log("❌ Token verification failed:", err.message);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Admin Access only
export const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

// Employer Access Only
export const isEmployer = (req, res, next) => {
  console.log("🔐 isEmployer check - User role:", req.user?.role);
  if (req.user?.role !== "employer") {
    console.log("❌ Access denied - not an employer");
    return res.status(403).json({ error: "Access denied. Employers only." });
  }
  console.log("✅ Employer access granted");
  next();
};

// Jobseeker Access Only
export const isJobSeeker = (req, res, next) => {
  if (req.user?.role !== "jobseeker") {
    return res.status(403).json({ error: "Access denied. Jobseekers only." });
  }
  next();
};
