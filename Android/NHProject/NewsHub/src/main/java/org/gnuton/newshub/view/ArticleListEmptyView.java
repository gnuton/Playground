package org.gnuton.newshub.view;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;

import org.gnuton.newshub.R;

/**
 * Created by gnuton on 9/19/13.
 */
public class ArticleListEmptyView extends LinearLayout {
    public static final int ID = R.id.ArticleListEmpty;

    private View mView;
    private View mViewToHide ;
    LayoutInflater mLayoutInflate;

    private final String TAG = "ArticleListEmptyView";

    public ArticleListEmptyView(Context context) {
        super(context);
        initialize();
    }

    public ArticleListEmptyView(Context context, AttributeSet attrs) {
        super(context, attrs);
        initialize();
    }

    private void initialize(){
        this.setId(this.ID);

        this.mLayoutInflate = (LayoutInflater) getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        if (this.mLayoutInflate != null) {
            // Inflate into this mView
            this.mView = this.mLayoutInflate.inflate(R.layout.articlelist_empty, this, true);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LayoutParams.MATCH_PARENT,
                    LayoutParams.MATCH_PARENT);
            this.setLayoutParams(lp);
        }
    }

    /*@TargetApi(Build.VERSION_CODES.HONEYCOMB)
    public ArticleListEmptyView(Context context, AttributeSet attrs, int theme) {
        super(context, attrs, theme);
    }*/

    @Override
    protected void onVisibilityChanged(View changedView, int visibility) {
        Log.d(TAG, changedView.toString());

        Log.d(TAG, "VISIBILITY ->" + String.valueOf(visibility));
        super.onVisibilityChanged(changedView, visibility);

        //if (this.mViewToHide == null || changedView != this)
        //    return;
    }

    @Override
    public void setVisibility(int visibility) {
        Log.d(TAG, String.valueOf(getVisibility()) + " ->" + String.valueOf(visibility));
        super.setVisibility(visibility);
        if (this.mViewToHide == null)
            return;

        if (visibility == View.VISIBLE) {
            this.mViewToHide.setVisibility(View.GONE);
        } else {
            this.mViewToHide.setVisibility(View.VISIBLE);
        }
    }

    /***
     * Article list grows in size. In order to grow the other mView
     * in the viewgroup has to be set to GONE
     *
     * @param v View which will be managed by this class
     */
    public void setViewToHide(View v) {
        this.mViewToHide = v;
    }
}