'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { uploadPortfolioImage, uploadSiteImage } from '@/app/admin/content/actions';
import { Button } from '@/components/ui/Button';
import { SITE_IMAGE_KINDS, type SiteImageKind } from '@/lib/schemas/common';
import { storageUrl } from '@/lib/utils/storage-url';
import { useAdminSession } from '../AdminSession';

/** Browser-side preview URL (the emulator host is only known on the server, so derive it). */
export function previewUrl(path: string): string {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return storageUrl(path, {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    FIREBASE_STORAGE_EMULATOR_HOST: projectId?.startsWith('demo-') ? '127.0.0.1:9199' : undefined,
  });
}

type Props = {
  id: string;
  itemId: string;
  label: string;
  paths: string[];
  multiple: boolean;
  /** Site image (Storage site/…: hero, logos, people); otherwise a portfolio image. */
  siteImage?: SiteImageKind;
  hint?: string;
  error?: string;
  onChange: (paths: string[]) => void;
};

/**
 * Upload images via a checked server action: portfolio images (A5) go to portfolio/{itemId}/…,
 * the hero background and tool logos to site/….
 */
export function ImageField({
  id,
  itemId,
  label,
  paths,
  multiple,
  siteImage,
  hint,
  error,
  onChange,
}: Props) {
  const t = useTranslations('Admin.content');
  const { getIdToken } = useAdminSession();
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isLogo = siteImage ? SITE_IMAGE_KINDS[siteImage].logo : false;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setUploadError(null);
    const added: string[] = [];
    try {
      for (const file of Array.from(multiple ? files : [files[0]!])) {
        const formData = new FormData();
        formData.append('file', file);
        let result;
        if (siteImage) {
          formData.append('kind', siteImage);
          result = await uploadSiteImage(await getIdToken(), formData);
        } else {
          formData.append('itemId', itemId);
          result = await uploadPortfolioImage(await getIdToken(), formData);
        }
        if (!result.ok) {
          setUploadError(
            t.has(`errors.${result.error}`) ? t(`errors.${result.error}`) : t('errors.server'),
          );
          break;
        }
        added.push(result.data.path);
      }
    } catch {
      setUploadError(t('errors.network'));
    } finally {
      if (added.length) onChange(multiple ? [...paths, ...added] : added);
      setBusy(false);
    }
  }

  const message = uploadError ?? error;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-medium">{label}</legend>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {paths.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {paths.map((path) => (
            <li key={path} className="flex flex-col items-start gap-1">
              <Image
                src={previewUrl(path)}
                alt=""
                width={120}
                height={90}
                unoptimized
                className={`h-[90px] w-[120px] rounded-md border border-border ${isLogo ? 'object-contain p-2' : 'object-cover'}`}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(paths.filter((p) => p !== path))}
              >
                {t('removeImage')}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {multiple
          ? t('uploadImages')
          : isLogo
            ? t(paths.length ? 'replaceLogo' : 'uploadLogo')
            : t(paths.length ? 'replaceImage' : 'uploadImage')}
      </label>
      <input
        id={id}
        type="file"
        accept={
          isLogo
            ? 'image/jpeg,image/png,image/webp,image/svg+xml'
            : 'image/jpeg,image/png,image/webp'
        }
        multiple={multiple}
        disabled={busy}
        onChange={(e) => {
          void upload(e.target.files);
          e.target.value = '';
        }}
        aria-describedby={message ? `${id}-error` : undefined}
        className="text-sm"
      />
      {busy && (
        <p role="status" className="text-sm">
          {t('uploading')}
        </p>
      )}
      {message && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {message}
        </p>
      )}
    </fieldset>
  );
}
