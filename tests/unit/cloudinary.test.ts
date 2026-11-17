import { describe, expect, it } from 'vitest';
import { cloudinaryConfig, signParams } from '@/lib/media/cloudinary';
import { imagePublicId } from '@/lib/media/cloudinary-url';

describe('cloudinary', () => {
  it('reads CLOUDINARY_URL from the dashboard format', () => {
    expect(cloudinaryConfig({ CLOUDINARY_URL: 'cloudinary://123:s3cr3t@my-cloud' })).toEqual({
      apiKey: '123',
      apiSecret: 's3cr3t',
      cloudName: 'my-cloud',
    });
    expect(cloudinaryConfig({})).toBeNull();
    expect(cloudinaryConfig({ CLOUDINARY_URL: 'https://example.com' })).toBeNull();
  });

  it('signs requests like the Cloudinary documentation example', () => {
    const params = {
      timestamp: '1315060510',
      public_id: 'sample_image',
      eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop',
    };
    expect(signParams(params, 'abcd')).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e');
  });

  it('drops only the file extension from public ids', () => {
    expect(imagePublicId('site/press/1-licence.v2.pdf')).toBe('site/press/1-licence.v2');
    expect(imagePublicId('site/hero/no-extension')).toBe('site/hero/no-extension');
  });
});
