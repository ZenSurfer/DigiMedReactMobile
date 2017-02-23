package com.awesomeproject;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import cn.mandata.react_native_mpchart.MPChartPackage;
import com.beefe.picker.PickerViewPackage;
import com.github.xinthink.rnmk.ReactMaterialKitPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import com.oblador.vectoricons.VectorIconsPackage;
import com.imagepicker.ImagePickerPackage;
import org.pgsqlite.SQLitePluginPackage;
import com.rnfs.RNFSPackage;
import com.reactnative.photoview.PhotoViewPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new PhotoViewPackage(),
          new RNFSPackage(),
          new SQLitePluginPackage(),
          new VectorIconsPackage(),
          new ReactMaterialKitPackage(),
          new ImagePickerPackage(),
          new MainReactPackage(),
            new MPChartPackage(),
            new PickerViewPackage(),
            new ReactMaterialKitPackage(),
            new RNFetchBlobPackage(),
            new FIRMessagingPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }
}
