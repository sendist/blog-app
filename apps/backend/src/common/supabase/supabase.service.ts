import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    // Create a unique filename: user-id-timestamp.jpg
    const filePath = `${userId}-${Date.now()}.${fileExt}`;

    const { data, error } = await this.supabase.storage
      .from('avatars') // bucket name
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // Get the Public URL
    const { data: publicUrlData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}