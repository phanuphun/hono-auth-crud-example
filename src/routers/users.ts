import { Hono } from "hono";
import { fileUpload } from "../middlewares/fileUpload.js";
import type { Env } from "../types/user.types.js";
import AuthManager from "../utils/AuthManager.js";
import FileManager from "../utils/fileManager.js";
import kenx from "../db/knexClient.js";

const user = new Hono<Env>();

user.get('/:id', async (c) => {
  const userId = c.req.param('id');
  try {
    const userDetail = await kenx('users')
      .select('id', 'username', 'firstName', 'lastName', 'role', 'avatar')
      .where({ id: userId })
      .first();

    if (!userDetail) {
      return c.json({
        ok: 0,
        error: 'User not found'
      }, 404);
    }

    return c.json({
      ok: 1,
      user: userDetail
    });
  } catch (err: any) {
    console.error(`Error fetching user detail: ${err}`);
    return c.json({
      ok: -1,
      message: 'Internal Server Error',
      error: <string>err
    }, 500);
  }
});

user.get('/', async (c) => {
  try {
    const users = await kenx('users').select('id', 'username', 'firstName', 'lastName', 'role', 'avatar');
    return c.json({
      ok: 1,
      users
    });
  } catch (err: any) {
    console.error(`Error fetching users: ${err}`);
    return c.json({
      ok: -1,
      message: 'Internal Server Error',
      error: <string>err
    }, 500);
  }
});

user.post('/', fileUpload, async (c) => {
  const body = await c.req.parseBody()
  const avatarFileName = <string>c.get('avatarFileName')
  try {
    if (!body.username || !body.password) {
      return c.json({
        ok: 0,
        error: 'Username and password are required'
      }, 400);
    }

    const authManager = new AuthManager();
    const hashedPassword = await authManager.hashPasswordMd5(body.password.toString());
    const userUuid = await authManager.createUUID();
    if (!userUuid || !hashedPassword) {
      throw new Error('Failed to create user, Please try again later');
    }

    const resCreateUser = await kenx('users').insert({
      id: userUuid,
      username: body.username,
      passwordHash: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role || 'customer',
      avatar: avatarFileName
    }).returning('*');

    return c.json({
      ok: 1,
      message: 'User created',
      user: resCreateUser[0]
    }, 201);

  } catch (err: any) {
    console.error(`Error creating user: ${err}`);
    const fileManager = new FileManager();
    fileManager.deleteFile(avatarFileName, 'avatars');
    return c.json({
      ok: -1,
      message: 'Internal Server Error',
      error: <string>err
    }, 500);
  }
});

user.delete('/:id', async (c) => {
  const userId = c.req.param('id');
  try {
    const user = await kenx('users').select('avatar').where({ id: userId }).first();
    if (user) {
      const fileManager = new FileManager();
      fileManager.deleteFile(user.avatar, 'avatars');
    }
    const resDeleteUser = await kenx('users').where({ id: userId }).del();
    if (resDeleteUser) {
      return c.json({
        ok: 1,
        message: 'User deleted'
      });
    }
    return c.json({
      ok: 0,
      error: 'User not found'
    }, 404);
  } catch (err: any) {
    console.error(`Error deleting user: ${err}`);
    return c.json({
      ok: -1,
      message: 'Internal Server Error',
      error: <string>err
    }, 500);
  }
});

user.put('/:id', fileUpload, async (c) => {
  const userId = c.req.param('id');
  const body = await c.req.parseBody();
  const newAvatarFileName = <string>c.get('avatarFileName');
  try {
    // Check if user exists
    const existingUser = await kenx('users').where({ id: userId }).first();
    if (!existingUser) {
      return c.json({
        ok: 0,
        error: 'User not found'
      }, 404);
    }

    // Handle avatar update
    let avatarToSave = existingUser.avatar;
    if (newAvatarFileName) {
      // Delete old avatar if exists
      if (existingUser.avatar) {
        const fileManager = new FileManager();
        fileManager.deleteFile(existingUser.avatar, 'avatars');
      }
      avatarToSave = newAvatarFileName;
    }

    // Prepare update data
    const updateData: any = {};
    if (body.username) updateData.username = body.username;
    if (body.firstName) updateData.firstName = body.firstName;
    if (body.lastName) updateData.lastName = body.lastName;
    if (body.role) updateData.role = body.role;
    if (avatarToSave) updateData.avatar = avatarToSave;
    if (body.password) {
      const authManager = new AuthManager();
      updateData.passwordHash = await authManager.hashPasswordMd5(body.password.toString());
    }

    // Update user in DB
    const updatedUser = await kenx('users')
      .where({ id: userId })
      .update(updateData)
      .returning('*');

    return c.json({
      ok: 1,
      message: 'User updated',
      user: updatedUser[0]
    });
  } catch (err: any) {
    console.error(`Error updating user: ${err}`);
    // Clean up new avatar if error occurs
    if (newAvatarFileName) {
      const fileManager = new FileManager();
      fileManager.deleteFile(newAvatarFileName, 'avatars');
    }
    return c.json({
      ok: -1,
      message: 'Internal Server Error',
      error: <string>err
    }, 500);
  }
});


export default user;