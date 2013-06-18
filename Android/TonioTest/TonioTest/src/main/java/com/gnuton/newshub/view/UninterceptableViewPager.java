package com.gnuton.newshub.view;

import android.content.Context;
import android.support.v4.view.ViewPager;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;

import com.gnuton.newshub.R;
import com.gnuton.newshub.utils.MyApp;

/**
 * Created by gnuton on 6/18/13.
 */

public class UninterceptableViewPager extends ViewPager {
    private final Animation mScaleUpAnimation = AnimationUtils.loadAnimation(MyApp.getContext(), R.animator.scaleup);
    private final Animation mScaleDownAnimation = AnimationUtils.loadAnimation(MyApp.getContext(), R.animator.scaledown);

    public UninterceptableViewPager(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public boolean onInterceptTouchEvent(MotionEvent ev) {
        // Tell our parent to stop intercepting our events!
        boolean ret = super.onInterceptTouchEvent(ev);
        if (ret) {
            getParent().requestDisallowInterceptTouchEvent(true);
        }
        return ret;
    }

    @Override
    public void setVisibility(int visibility)
    {
        if (getVisibility() != visibility)
        {
            if (visibility == VISIBLE)
            {
                startAnimation(mScaleUpAnimation);
            }
            else if ((visibility == INVISIBLE) || (visibility == GONE))
            {
                startAnimation(mScaleUpAnimation); //FIXME It doesn't really work!!!
            }
        }
        super.setVisibility(visibility);
    }
}