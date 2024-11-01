import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getDataSource } from "../database/context";
import { UserSettings } from "../entities/UserSettings";

export const getUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settingsRepository = getDataSource().getRepository(UserSettings);

    let settings = await settingsRepository.findOne({
      where: { user: { id: req.user!.id } },
      relations: ["user"],
    });

    if (!settings) {
      // Create default settings if none exist
      settings = settingsRepository.create({
        user: req.user!,
      });
      await settingsRepository.save(settings);
    }

    return res.json(settings);
  } catch (error) {
    console.error("Get user settings error:", error);
    return res.status(500).json({ error: "Failed to fetch user settings" });
  }
};

export const updateUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settingsRepository = getDataSource().getRepository(UserSettings);
    const { notifications, currency, dateFormat, language, display } = req.body;

    let settings = await settingsRepository.findOne({
      where: { user: { id: req.user!.id } },
      relations: ["user"],
    });

    if (!settings) {
      settings = settingsRepository.create({
        user: req.user!,
      });
    }

    // Update only provided fields
    if (notifications) settings.notifications = notifications;
    if (currency) settings.currency = currency;
    if (dateFormat) settings.dateFormat = dateFormat;
    if (language) settings.language = language;
    if (display) settings.display = display;

    await settingsRepository.save(settings);
    return res.json(settings);
  } catch (error) {
    console.error("Update user settings error:", error);
    return res.status(500).json({ error: "Failed to update user settings" });
  }
};
