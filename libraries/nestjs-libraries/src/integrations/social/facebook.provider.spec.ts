import { FacebookProvider } from './facebook.provider';
import { PostDetails } from './social.integrations.interface';

describe('FacebookProvider', () => {
  let provider: FacebookProvider;

  beforeEach(() => {
    provider = new FacebookProvider();
  });

  describe('validateMediaContent', () => {
    it('should allow posts with only photos', () => {
      const postDetails: PostDetails[] = [{
        id: '1',
        message: 'Test post',
        media: [
          { url: 'photo1.jpg', type: 'image', path: 'photo1.jpg' }
        ],
        settings: {}
      }];

      expect(() => provider['validateMediaContent'](postDetails)).not.toThrow();
    });

    it('should allow posts with a single video', () => {
      const postDetails: PostDetails[] = [{
        id: '1',
        message: 'Test video post',
        media: [
          { url: 'video.mp4', type: 'video', path: 'video.mp4' }
        ],
        settings: {}
      }];

      expect(() => provider['validateMediaContent'](postDetails)).not.toThrow();
    });

    it('should throw error when mixing videos and photos', () => {
      const postDetails: PostDetails[] = [{
        id: '1',
        message: 'Mixed media post',
        media: [
          { url: 'video.mp4', type: 'video', path: 'video.mp4' },
          { url: 'photo.jpg', type: 'image', path: 'photo.jpg' }
        ],
        settings: {}
      }];

      expect(() => provider['validateMediaContent'](postDetails))
        .toThrow('Facebook posts cannot contain both videos and photos');
    });

    it('should throw error when posting multiple videos', () => {
      const postDetails: PostDetails[] = [{
        id: '1',
        message: 'Multiple videos post',
        media: [
          { url: 'video1.mp4', type: 'video', path: 'video1.mp4' },
          { url: 'video2.mp4', type: 'video', path: 'video2.mp4' }
        ],
        settings: {}
      }];

      expect(() => provider['validateMediaContent'](postDetails))
        .toThrow('Facebook posts can only contain one video at a time');
    });
  });
}); 