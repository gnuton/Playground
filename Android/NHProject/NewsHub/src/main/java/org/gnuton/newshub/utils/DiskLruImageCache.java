package org.gnuton.newshub.utils;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Environment;
import android.util.Log;

import org.gnuton.newshub.BuildConfig;
import com.jakewharton.disklrucache.DiskLruCache;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Created by gnuton on 6/18/13.
 * from http://stackoverflow.com/questions/10185898/using-disklrucache-in-android-4-0-does-not-provide-for-opencache-method
 */

public class DiskLruImageCache {
    private DiskLruCache mDiskCache;
    private Bitmap.CompressFormat mCompressFormat = Bitmap.CompressFormat.JPEG;
    private int mCompressQuality = 70;
    private static final int APP_VERSION = 1;
    private static final int VALUE_COUNT = 1;
    private static final int DISK_CACHE_SIZE = 1024 * 1024 * 10; // 10MB

    private static final String TAG = "DiskLruImageCache";

    public DiskLruImageCache(){
        Context c = MyApp.getContext();

        // Generate unique name
        Resources appR = c.getResources();
        CharSequence appName = appR.getText(appR.getIdentifier(
                "app_name", "string", c.getPackageName()));
        String uniqueName = TAG + appName;

        try {
            final File diskCacheDir = getDiskCacheDir(MyApp.getContext(), uniqueName );
            mDiskCache = DiskLruCache.open( diskCacheDir, APP_VERSION, VALUE_COUNT, DISK_CACHE_SIZE );
            mCompressFormat = Bitmap.CompressFormat.PNG;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public DiskLruImageCache( Context context,String uniqueName, int diskCacheSize,
                              Bitmap.CompressFormat compressFormat, int quality ) {
        try {
            final File diskCacheDir = getDiskCacheDir(context, uniqueName );
            mDiskCache = DiskLruCache.open( diskCacheDir, APP_VERSION, VALUE_COUNT, diskCacheSize );
            mCompressFormat = compressFormat;
            mCompressQuality = quality;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private boolean writeBitmapToFile( Bitmap bitmap, DiskLruCache.Editor editor )
            throws IOException, FileNotFoundException {
        if ( BuildConfig.DEBUG ) {
            Log.d(TAG, "WriteBirmapToFile");
        }
        OutputStream out = null;
        try {
            out = new BufferedOutputStream( editor.newOutputStream( 0 ), Utils.IO_BUFFER_SIZE );
            return bitmap.compress( mCompressFormat, mCompressQuality, out );
        } finally {
            if ( out != null ) {
                out.close();
            }
        }
    }

    private File getDiskCacheDir(Context context, String uniqueName) {
        if ( BuildConfig.DEBUG ) {
            Log.d(TAG, "getDiskChacheDir");
        }
        // Check if media is mounted or storage is built-in, if so, try and use external cache dir
        // otherwise use internal cache dir
        final String cachePath =
                Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState()) ||
                        !Utils.isExternalStorageRemovable() ?
                        Utils.getExternalCacheDir(context).getPath() :
                        context.getCacheDir().getPath();

        return new File(cachePath + File.separator + uniqueName);
    }

    public void put( String key, Bitmap data ) {
        if ( BuildConfig.DEBUG ) {
            Log.d(TAG, "put " + key);
        }
        DiskLruCache.Editor editor = null;
        try {
            editor = mDiskCache.edit( key );
            if ( editor == null ) {
                return;
            }

            if( writeBitmapToFile( data, editor ) ) {
                mDiskCache.flush();
                editor.commit();
                if ( BuildConfig.DEBUG ) {
                    Log.d("cache_test_DISK_", "image put on disk cache " + key);
                }
            } else {
                editor.abort();
                if ( BuildConfig.DEBUG ) {
                    Log.d( "cache_test_DISK_", "ERROR on: image put on disk cache " + key );
                }
            }
        } catch (IOException e) {
            if ( BuildConfig.DEBUG ) {
                Log.d( "cache_test_DISK_", "ERROR on: image put on disk cache " + key );
            }
            try {
                if ( editor != null ) {
                    editor.abort();
                }
            } catch (IOException ignored) {
            }
        }

    }

    public Bitmap getBitmap( String key ) {
        if ( BuildConfig.DEBUG ) {
            Log.d(TAG, "getBitmap " + key);
        }

        Bitmap bitmap = null;
        DiskLruCache.Snapshot snapshot = null;
        try {

            snapshot = mDiskCache.get( key );
            if ( snapshot == null ) {
                return null;
            }
            final InputStream in = snapshot.getInputStream( 0 );
            if ( in != null ) {
                final BufferedInputStream buffIn =
                        new BufferedInputStream( in, Utils.IO_BUFFER_SIZE );
                bitmap = BitmapFactory.decodeStream(buffIn);
            }
        } catch ( IOException e ) {
            e.printStackTrace();
        } finally {
            if ( snapshot != null ) {
                snapshot.close();
            }
        }

        if ( BuildConfig.DEBUG ) {
            Log.d( "cache_test_DISK_", bitmap == null ? "" : "image read from disk " + key);
        }

        return bitmap;

    }

    public boolean containsKey( String key ) {
        if ( BuildConfig.DEBUG ) {
            Log.d(TAG, "containsKey " + key);
        }
        boolean contained = false;
        DiskLruCache.Snapshot snapshot = null;
        try {
            snapshot = mDiskCache.get( key );
            contained = snapshot != null;
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if ( snapshot != null ) {
                snapshot.close();
            }
        }

        return contained;

    }

    public void clearCache() {
        if ( BuildConfig.DEBUG ) {
            Log.d( TAG, "disk cache CLEARED");
        }
        try {
            mDiskCache.delete();
        } catch ( IOException e ) {
            e.printStackTrace();
        }
    }

    public File getCacheFolder() {
        if ( BuildConfig.DEBUG ) {
            Log.d( TAG, "getCacheFolder");
        }
        return mDiskCache.getDirectory();
    }

}