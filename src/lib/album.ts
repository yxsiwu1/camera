export type AlbumItem = { uri: string; title: string; tag: string };

export function getAlbumImages(capturedUri: string | null, savedUris: string[]): AlbumItem[] {
  const uris = [...new Set([...(capturedUri ? [capturedUri] : []), ...savedUris])];
  return uris.map(uri => ({
    uri,
    title: '我的作品',
    tag: savedUris.includes(uri) ? '已保存' : '本次拍摄 · 尚未保存',
  }));
}
