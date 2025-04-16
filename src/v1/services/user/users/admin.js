const { User } = require("../../../models/user/user");
const httpStatus = require("http-status");
const { ApiError } = require("../../../middleware/apiError");
const errors = require("../../../config/errors");

module.exports.changeUserRole = async (email, role) => {
  try {
    // Check if user exists
    const user = await this.findUserByEmail(email);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    if (user.isAdmin()) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.updateAdminRole;
      throw new ApiError(statusCode, message);
    }

    // Update user's role
    user.updateRole(role);

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.verifyUser = async (email) => {
  try {
    // Check if used exists
    const user = await this.findUserByEmail(email);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user's email is already verified
    if (user.isEmailVerified()) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.alreadyVerified;
      throw new ApiError(statusCode, message);
    }

    // Verify user's email
    user.verifyEmail();

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.findUserByEmail = async (
  email,
  role = "",
  withError = false
) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Throwing error if no user found and `throwError = true`
    if (withError && !user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Throwing error if a user was found but the specified `role` does not match
    // This happens in case of role is added as an argument
    // If role is falsy that means this search does not care of role
    if (withError && user && role && user.getRole() !== role) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.foundWithInvalidRole;
      throw new ApiError(statusCode, message);
    }

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.getMostUsedUsers = async (admin, page, limit) => {
  try {
    page = parseInt(page);
    limit = parseInt(limit);

    // Decide query criteria
    const queryCriteria = { _id: { $not: { $eq: admin._id } } };

    // Find users in the given page
    const users = await User.find(queryCriteria)
      .sort({ noOfRequests: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Check if users exist
    if (!users || !users.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.noUsers;
      throw new ApiError(statusCode, message);
    }

    // Get the count of all users
    const count = await User.count(queryCriteria);

    return {
      users,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  } catch (err) {
    throw err;
  }
};
