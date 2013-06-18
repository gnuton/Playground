package com.gnuton.newshub.adapters;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import com.gnuton.newshub.utils.MyApp;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * Created by gnuton on 6/18/13.
 */

public class ImageAdapter extends PagerAdapter {
    Context mContext;
    public List<Drawable> mImages = new ArrayList<Drawable>();
    private List<ImageView> mImageViews = new ArrayList<ImageView>();

    public ImageAdapter(Context context){
        this.mContext=context;
        while (mImageViews.size() < 4) {
            ImageView imageView = new ImageView(mContext);
            imageView.setBackgroundColor(Color.parseColor("#000000"));
            imageView.setScaleType(ImageView.ScaleType.FIT_CENTER);
            this.mImageViews.add(imageView);
        }
    }

    @Override
    public int getCount() {
        return mImages.size();
    }

    @Override
    public boolean isViewFromObject(View view, Object object) {
        return view == ((ImageView) object);
    }

    @Override
    public Object instantiateItem(ViewGroup container, int position) {
        ImageView imageView = mImageViews.get(position % 3);
        imageView.setImageDrawable(mImages.get(position));
        ((ViewPager) container).addView(imageView, 0);
        return imageView;
    }

    @Override
    public void destroyItem(ViewGroup container, int position, Object object) {
        ImageView imageView = (ImageView) object;
        ((ViewPager) container).removeView(imageView);
    }

    @Override
    public int getItemPosition(Object object) {
        return POSITION_NONE;
    }
}