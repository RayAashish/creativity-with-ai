package com.cliplocker.app;

import android.app.Activity;
import android.app.Service;
import android.content.Context;
import android.view.View;
import androidx.fragment.app.Fragment;
import androidx.hilt.work.HiltWorkerFactory;
import androidx.hilt.work.WorkerAssistedFactory;
import androidx.hilt.work.WorkerFactoryModule_ProvideFactoryFactory;
import androidx.lifecycle.SavedStateHandle;
import androidx.lifecycle.ViewModel;
import androidx.work.ListenableWorker;
import androidx.work.WorkerParameters;
import com.cliplocker.app.core.crypto.DatabaseKeyManager;
import com.cliplocker.app.data.local.AppDatabase;
import com.cliplocker.app.data.local.ClipDao;
import com.cliplocker.app.data.local.IgnoreAppDao;
import com.cliplocker.app.data.preferences.PreferencesManager;
import com.cliplocker.app.data.repository.ClipRepository;
import com.cliplocker.app.data.storage.ImageStorageManager;
import com.cliplocker.app.di.DatabaseModule_ProvideAppDatabaseFactory;
import com.cliplocker.app.di.DatabaseModule_ProvideClipDaoFactory;
import com.cliplocker.app.di.DatabaseModule_ProvideDatabaseKeyManagerFactory;
import com.cliplocker.app.di.DatabaseModule_ProvideIgnoreAppDaoFactory;
import com.cliplocker.app.di.DatabaseModule_ProvideImageStorageManagerFactory;
import com.cliplocker.app.di.RepositoryModule_ProvideClipRepositoryFactory;
import com.cliplocker.app.di.RepositoryModule_ProvidePreferencesManagerFactory;
import com.cliplocker.app.service.BootReceiver;
import com.cliplocker.app.service.BootReceiver_MembersInjector;
import com.cliplocker.app.service.CaptureActivity;
import com.cliplocker.app.service.CaptureActivity_MembersInjector;
import com.cliplocker.app.service.ClipboardAccessibilityService;
import com.cliplocker.app.service.ClipboardAccessibilityService_MembersInjector;
import com.cliplocker.app.service.ClipboardBubbleService;
import com.cliplocker.app.service.ClipboardCaptureService;
import com.cliplocker.app.service.ClipboardCaptureService_MembersInjector;
import com.cliplocker.app.service.CliplockerTileService;
import com.cliplocker.app.service.CliplockerTileService_MembersInjector;
import com.cliplocker.app.service.ScreenStateReceiver;
import com.cliplocker.app.service.ScreenStateReceiver_MembersInjector;
import com.cliplocker.app.ui.MainActivity;
import com.cliplocker.app.ui.MainActivity_MembersInjector;
import com.cliplocker.app.ui.detail.ClipDetailViewModel;
import com.cliplocker.app.ui.detail.ClipDetailViewModel_HiltModules;
import com.cliplocker.app.ui.main.MainViewModel;
import com.cliplocker.app.ui.main.MainViewModel_HiltModules;
import com.cliplocker.app.ui.settings.SettingsViewModel;
import com.cliplocker.app.ui.settings.SettingsViewModel_HiltModules;
import com.cliplocker.app.worker.ExpiryWorker;
import com.cliplocker.app.worker.ExpiryWorker_AssistedFactory;
import com.cliplocker.app.worker.RetentionWorker;
import com.cliplocker.app.worker.RetentionWorker_AssistedFactory;
import dagger.hilt.android.ActivityRetainedLifecycle;
import dagger.hilt.android.ViewModelLifecycle;
import dagger.hilt.android.internal.builders.ActivityComponentBuilder;
import dagger.hilt.android.internal.builders.ActivityRetainedComponentBuilder;
import dagger.hilt.android.internal.builders.FragmentComponentBuilder;
import dagger.hilt.android.internal.builders.ServiceComponentBuilder;
import dagger.hilt.android.internal.builders.ViewComponentBuilder;
import dagger.hilt.android.internal.builders.ViewModelComponentBuilder;
import dagger.hilt.android.internal.builders.ViewWithFragmentComponentBuilder;
import dagger.hilt.android.internal.lifecycle.DefaultViewModelFactories;
import dagger.hilt.android.internal.lifecycle.DefaultViewModelFactories_InternalFactoryFactory_Factory;
import dagger.hilt.android.internal.managers.ActivityRetainedComponentManager_LifecycleModule_ProvideActivityRetainedLifecycleFactory;
import dagger.hilt.android.internal.managers.SavedStateHandleHolder;
import dagger.hilt.android.internal.modules.ApplicationContextModule;
import dagger.hilt.android.internal.modules.ApplicationContextModule_ProvideContextFactory;
import dagger.internal.DaggerGenerated;
import dagger.internal.DoubleCheck;
import dagger.internal.IdentifierNameString;
import dagger.internal.KeepFieldType;
import dagger.internal.LazyClassKeyMap;
import dagger.internal.MapBuilder;
import dagger.internal.Preconditions;
import dagger.internal.Provider;
import dagger.internal.SingleCheck;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Generated;

@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava",
    "cast"
})
public final class DaggerCliplockerApp_HiltComponents_SingletonC {
  private DaggerCliplockerApp_HiltComponents_SingletonC() {
  }

  public static Builder builder() {
    return new Builder();
  }

  public static final class Builder {
    private ApplicationContextModule applicationContextModule;

    private Builder() {
    }

    public Builder applicationContextModule(ApplicationContextModule applicationContextModule) {
      this.applicationContextModule = Preconditions.checkNotNull(applicationContextModule);
      return this;
    }

    public CliplockerApp_HiltComponents.SingletonC build() {
      Preconditions.checkBuilderRequirement(applicationContextModule, ApplicationContextModule.class);
      return new SingletonCImpl(applicationContextModule);
    }
  }

  private static final class ActivityRetainedCBuilder implements CliplockerApp_HiltComponents.ActivityRetainedC.Builder {
    private final SingletonCImpl singletonCImpl;

    private SavedStateHandleHolder savedStateHandleHolder;

    private ActivityRetainedCBuilder(SingletonCImpl singletonCImpl) {
      this.singletonCImpl = singletonCImpl;
    }

    @Override
    public ActivityRetainedCBuilder savedStateHandleHolder(
        SavedStateHandleHolder savedStateHandleHolder) {
      this.savedStateHandleHolder = Preconditions.checkNotNull(savedStateHandleHolder);
      return this;
    }

    @Override
    public CliplockerApp_HiltComponents.ActivityRetainedC build() {
      Preconditions.checkBuilderRequirement(savedStateHandleHolder, SavedStateHandleHolder.class);
      return new ActivityRetainedCImpl(singletonCImpl, savedStateHandleHolder);
    }
  }

  private static final class ActivityCBuilder implements CliplockerApp_HiltComponents.ActivityC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private Activity activity;

    private ActivityCBuilder(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
    }

    @Override
    public ActivityCBuilder activity(Activity activity) {
      this.activity = Preconditions.checkNotNull(activity);
      return this;
    }

    @Override
    public CliplockerApp_HiltComponents.ActivityC build() {
      Preconditions.checkBuilderRequirement(activity, Activity.class);
      return new ActivityCImpl(singletonCImpl, activityRetainedCImpl, activity);
    }
  }

  private static final class FragmentCBuilder implements CliplockerApp_HiltComponents.FragmentC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private Fragment fragment;

    private FragmentCBuilder(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;
    }

    @Override
    public FragmentCBuilder fragment(Fragment fragment) {
      this.fragment = Preconditions.checkNotNull(fragment);
      return this;
    }

    @Override
    public CliplockerApp_HiltComponents.FragmentC build() {
      Preconditions.checkBuilderRequirement(fragment, Fragment.class);
      return new FragmentCImpl(singletonCImpl, activityRetainedCImpl, activityCImpl, fragment);
    }
  }

  private static final class ViewWithFragmentCBuilder implements CliplockerApp_HiltComponents.ViewWithFragmentC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private final FragmentCImpl fragmentCImpl;

    private View view;

    private ViewWithFragmentCBuilder(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl,
        FragmentCImpl fragmentCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;
      this.fragmentCImpl = fragmentCImpl;
    }

    @Override
    public ViewWithFragmentCBuilder view(View view) {
      this.view = Preconditions.checkNotNull(view);
      return this;
    }

    @Override
    public CliplockerApp_HiltComponents.ViewWithFragmentC build() {
      Preconditions.checkBuilderRequirement(view, View.class);
      return new ViewWithFragmentCImpl(singletonCImpl, activityRetainedCImpl, activityCImpl, fragmentCImpl, view);
    }
  }

  private static final class ViewCBuilder implements CliplockerApp_HiltComponents.ViewC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private View view;

    private ViewCBuilder(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl,
        ActivityCImpl activityCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;
    }

    @Override
    public ViewCBuilder view(View view) {
      this.view = Preconditions.checkNotNull(view);
      return this;
    }

    @Override
    public CliplockerApp_HiltComponents.ViewC build() {
      Preconditions.checkBuilderRequirement(view, View.class);
      return new ViewCImpl(singletonCImpl, activityRetainedCImpl, activityCImpl, view);
    }
  }

  private static final class ViewModelCBuilder implements CliplockerApp_HiltComponents.ViewModelC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private SavedStateHandle savedStateHandle;

    private ViewModelLifecycle viewModelLifecycle;

    private ViewModelCBuilder(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
    }

    @Override
    public ViewModelCBuilder savedStateHandle(SavedStateHandle handle) {
      this.savedStateHandle = Preconditions.checkNotNull(handle);
      return this;
    }

    @Override
    public ViewModelCBuilder viewModelLifecycle(ViewModelLifecycle viewModelLifecycle) {
      this.viewModelLifecycle = Preconditions.checkNotNull(viewModelLifecycle);
      return this;
    }

    @Override
    public CliplockerApp_HiltComponents.ViewModelC build() {
      Preconditions.checkBuilderRequirement(savedStateHandle, SavedStateHandle.class);
      Preconditions.checkBuilderRequirement(viewModelLifecycle, ViewModelLifecycle.class);
      return new ViewModelCImpl(singletonCImpl, activityRetainedCImpl, savedStateHandle, viewModelLifecycle);
    }
  }

  private static final class ServiceCBuilder implements CliplockerApp_HiltComponents.ServiceC.Builder {
    private final SingletonCImpl singletonCImpl;

    private Service service;

    private ServiceCBuilder(SingletonCImpl singletonCImpl) {
      this.singletonCImpl = singletonCImpl;
    }

    @Override
    public ServiceCBuilder service(Service service) {
      this.service = Preconditions.checkNotNull(service);
      return this;
    }

    @Override
    public CliplockerApp_HiltComponents.ServiceC build() {
      Preconditions.checkBuilderRequirement(service, Service.class);
      return new ServiceCImpl(singletonCImpl, service);
    }
  }

  private static final class ViewWithFragmentCImpl extends CliplockerApp_HiltComponents.ViewWithFragmentC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private final FragmentCImpl fragmentCImpl;

    private final ViewWithFragmentCImpl viewWithFragmentCImpl = this;

    private ViewWithFragmentCImpl(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl,
        FragmentCImpl fragmentCImpl, View viewParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;
      this.fragmentCImpl = fragmentCImpl;


    }
  }

  private static final class FragmentCImpl extends CliplockerApp_HiltComponents.FragmentC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private final FragmentCImpl fragmentCImpl = this;

    private FragmentCImpl(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl,
        Fragment fragmentParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;


    }

    @Override
    public DefaultViewModelFactories.InternalFactoryFactory getHiltInternalFactoryFactory() {
      return activityCImpl.getHiltInternalFactoryFactory();
    }

    @Override
    public ViewWithFragmentComponentBuilder viewWithFragmentComponentBuilder() {
      return new ViewWithFragmentCBuilder(singletonCImpl, activityRetainedCImpl, activityCImpl, fragmentCImpl);
    }
  }

  private static final class ViewCImpl extends CliplockerApp_HiltComponents.ViewC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private final ViewCImpl viewCImpl = this;

    private ViewCImpl(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl,
        ActivityCImpl activityCImpl, View viewParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;


    }
  }

  private static final class ActivityCImpl extends CliplockerApp_HiltComponents.ActivityC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl = this;

    private ActivityCImpl(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, Activity activityParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;


    }

    @Override
    public void injectCaptureActivity(CaptureActivity captureActivity) {
      injectCaptureActivity2(captureActivity);
    }

    @Override
    public void injectMainActivity(MainActivity mainActivity) {
      injectMainActivity2(mainActivity);
    }

    @Override
    public DefaultViewModelFactories.InternalFactoryFactory getHiltInternalFactoryFactory() {
      return DefaultViewModelFactories_InternalFactoryFactory_Factory.newInstance(getViewModelKeys(), new ViewModelCBuilder(singletonCImpl, activityRetainedCImpl));
    }

    @Override
    public Map<Class<?>, Boolean> getViewModelKeys() {
      return LazyClassKeyMap.<Boolean>of(MapBuilder.<String, Boolean>newMapBuilder(3).put(LazyClassKeyProvider.com_cliplocker_app_ui_detail_ClipDetailViewModel, ClipDetailViewModel_HiltModules.KeyModule.provide()).put(LazyClassKeyProvider.com_cliplocker_app_ui_main_MainViewModel, MainViewModel_HiltModules.KeyModule.provide()).put(LazyClassKeyProvider.com_cliplocker_app_ui_settings_SettingsViewModel, SettingsViewModel_HiltModules.KeyModule.provide()).build());
    }

    @Override
    public ViewModelComponentBuilder getViewModelComponentBuilder() {
      return new ViewModelCBuilder(singletonCImpl, activityRetainedCImpl);
    }

    @Override
    public FragmentComponentBuilder fragmentComponentBuilder() {
      return new FragmentCBuilder(singletonCImpl, activityRetainedCImpl, activityCImpl);
    }

    @Override
    public ViewComponentBuilder viewComponentBuilder() {
      return new ViewCBuilder(singletonCImpl, activityRetainedCImpl, activityCImpl);
    }

    private CaptureActivity injectCaptureActivity2(CaptureActivity instance) {
      CaptureActivity_MembersInjector.injectClipRepository(instance, singletonCImpl.provideClipRepositoryProvider.get());
      return instance;
    }

    private MainActivity injectMainActivity2(MainActivity instance) {
      MainActivity_MembersInjector.injectPreferencesManager(instance, singletonCImpl.providePreferencesManagerProvider.get());
      MainActivity_MembersInjector.injectClipRepository(instance, singletonCImpl.provideClipRepositoryProvider.get());
      return instance;
    }

    @IdentifierNameString
    private static final class LazyClassKeyProvider {
      static String com_cliplocker_app_ui_detail_ClipDetailViewModel = "com.cliplocker.app.ui.detail.ClipDetailViewModel";

      static String com_cliplocker_app_ui_main_MainViewModel = "com.cliplocker.app.ui.main.MainViewModel";

      static String com_cliplocker_app_ui_settings_SettingsViewModel = "com.cliplocker.app.ui.settings.SettingsViewModel";

      @KeepFieldType
      ClipDetailViewModel com_cliplocker_app_ui_detail_ClipDetailViewModel2;

      @KeepFieldType
      MainViewModel com_cliplocker_app_ui_main_MainViewModel2;

      @KeepFieldType
      SettingsViewModel com_cliplocker_app_ui_settings_SettingsViewModel2;
    }
  }

  private static final class ViewModelCImpl extends CliplockerApp_HiltComponents.ViewModelC {
    private final SavedStateHandle savedStateHandle;

    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ViewModelCImpl viewModelCImpl = this;

    private Provider<ClipDetailViewModel> clipDetailViewModelProvider;

    private Provider<MainViewModel> mainViewModelProvider;

    private Provider<SettingsViewModel> settingsViewModelProvider;

    private ViewModelCImpl(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, SavedStateHandle savedStateHandleParam,
        ViewModelLifecycle viewModelLifecycleParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.savedStateHandle = savedStateHandleParam;
      initialize(savedStateHandleParam, viewModelLifecycleParam);

    }

    @SuppressWarnings("unchecked")
    private void initialize(final SavedStateHandle savedStateHandleParam,
        final ViewModelLifecycle viewModelLifecycleParam) {
      this.clipDetailViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 0);
      this.mainViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 1);
      this.settingsViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 2);
    }

    @Override
    public Map<Class<?>, javax.inject.Provider<ViewModel>> getHiltViewModelMap() {
      return LazyClassKeyMap.<javax.inject.Provider<ViewModel>>of(MapBuilder.<String, javax.inject.Provider<ViewModel>>newMapBuilder(3).put(LazyClassKeyProvider.com_cliplocker_app_ui_detail_ClipDetailViewModel, ((Provider) clipDetailViewModelProvider)).put(LazyClassKeyProvider.com_cliplocker_app_ui_main_MainViewModel, ((Provider) mainViewModelProvider)).put(LazyClassKeyProvider.com_cliplocker_app_ui_settings_SettingsViewModel, ((Provider) settingsViewModelProvider)).build());
    }

    @Override
    public Map<Class<?>, Object> getHiltViewModelAssistedMap() {
      return Collections.<Class<?>, Object>emptyMap();
    }

    @IdentifierNameString
    private static final class LazyClassKeyProvider {
      static String com_cliplocker_app_ui_settings_SettingsViewModel = "com.cliplocker.app.ui.settings.SettingsViewModel";

      static String com_cliplocker_app_ui_detail_ClipDetailViewModel = "com.cliplocker.app.ui.detail.ClipDetailViewModel";

      static String com_cliplocker_app_ui_main_MainViewModel = "com.cliplocker.app.ui.main.MainViewModel";

      @KeepFieldType
      SettingsViewModel com_cliplocker_app_ui_settings_SettingsViewModel2;

      @KeepFieldType
      ClipDetailViewModel com_cliplocker_app_ui_detail_ClipDetailViewModel2;

      @KeepFieldType
      MainViewModel com_cliplocker_app_ui_main_MainViewModel2;
    }

    private static final class SwitchingProvider<T> implements Provider<T> {
      private final SingletonCImpl singletonCImpl;

      private final ActivityRetainedCImpl activityRetainedCImpl;

      private final ViewModelCImpl viewModelCImpl;

      private final int id;

      SwitchingProvider(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl,
          ViewModelCImpl viewModelCImpl, int id) {
        this.singletonCImpl = singletonCImpl;
        this.activityRetainedCImpl = activityRetainedCImpl;
        this.viewModelCImpl = viewModelCImpl;
        this.id = id;
      }

      @SuppressWarnings("unchecked")
      @Override
      public T get() {
        switch (id) {
          case 0: // com.cliplocker.app.ui.detail.ClipDetailViewModel 
          return (T) new ClipDetailViewModel(singletonCImpl.provideClipRepositoryProvider.get(), singletonCImpl.provideImageStorageManagerProvider.get(), viewModelCImpl.savedStateHandle);

          case 1: // com.cliplocker.app.ui.main.MainViewModel 
          return (T) new MainViewModel(singletonCImpl.provideClipRepositoryProvider.get(), singletonCImpl.providePreferencesManagerProvider.get(), singletonCImpl.provideImageStorageManagerProvider.get());

          case 2: // com.cliplocker.app.ui.settings.SettingsViewModel 
          return (T) new SettingsViewModel(singletonCImpl.providePreferencesManagerProvider.get(), singletonCImpl.provideClipRepositoryProvider.get());

          default: throw new AssertionError(id);
        }
      }
    }
  }

  private static final class ActivityRetainedCImpl extends CliplockerApp_HiltComponents.ActivityRetainedC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl = this;

    private Provider<ActivityRetainedLifecycle> provideActivityRetainedLifecycleProvider;

    private ActivityRetainedCImpl(SingletonCImpl singletonCImpl,
        SavedStateHandleHolder savedStateHandleHolderParam) {
      this.singletonCImpl = singletonCImpl;

      initialize(savedStateHandleHolderParam);

    }

    @SuppressWarnings("unchecked")
    private void initialize(final SavedStateHandleHolder savedStateHandleHolderParam) {
      this.provideActivityRetainedLifecycleProvider = DoubleCheck.provider(new SwitchingProvider<ActivityRetainedLifecycle>(singletonCImpl, activityRetainedCImpl, 0));
    }

    @Override
    public ActivityComponentBuilder activityComponentBuilder() {
      return new ActivityCBuilder(singletonCImpl, activityRetainedCImpl);
    }

    @Override
    public ActivityRetainedLifecycle getActivityRetainedLifecycle() {
      return provideActivityRetainedLifecycleProvider.get();
    }

    private static final class SwitchingProvider<T> implements Provider<T> {
      private final SingletonCImpl singletonCImpl;

      private final ActivityRetainedCImpl activityRetainedCImpl;

      private final int id;

      SwitchingProvider(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl,
          int id) {
        this.singletonCImpl = singletonCImpl;
        this.activityRetainedCImpl = activityRetainedCImpl;
        this.id = id;
      }

      @SuppressWarnings("unchecked")
      @Override
      public T get() {
        switch (id) {
          case 0: // dagger.hilt.android.ActivityRetainedLifecycle 
          return (T) ActivityRetainedComponentManager_LifecycleModule_ProvideActivityRetainedLifecycleFactory.provideActivityRetainedLifecycle();

          default: throw new AssertionError(id);
        }
      }
    }
  }

  private static final class ServiceCImpl extends CliplockerApp_HiltComponents.ServiceC {
    private final SingletonCImpl singletonCImpl;

    private final ServiceCImpl serviceCImpl = this;

    private ServiceCImpl(SingletonCImpl singletonCImpl, Service serviceParam) {
      this.singletonCImpl = singletonCImpl;


    }

    @Override
    public void injectClipboardAccessibilityService(
        ClipboardAccessibilityService clipboardAccessibilityService) {
      injectClipboardAccessibilityService2(clipboardAccessibilityService);
    }

    @Override
    public void injectClipboardBubbleService(ClipboardBubbleService clipboardBubbleService) {
    }

    @Override
    public void injectClipboardCaptureService(ClipboardCaptureService clipboardCaptureService) {
      injectClipboardCaptureService2(clipboardCaptureService);
    }

    @Override
    public void injectCliplockerTileService(CliplockerTileService cliplockerTileService) {
      injectCliplockerTileService2(cliplockerTileService);
    }

    private ClipboardAccessibilityService injectClipboardAccessibilityService2(
        ClipboardAccessibilityService instance) {
      ClipboardAccessibilityService_MembersInjector.injectClipRepository(instance, singletonCImpl.provideClipRepositoryProvider.get());
      return instance;
    }

    private ClipboardCaptureService injectClipboardCaptureService2(
        ClipboardCaptureService instance) {
      ClipboardCaptureService_MembersInjector.injectClipRepository(instance, singletonCImpl.provideClipRepositoryProvider.get());
      ClipboardCaptureService_MembersInjector.injectPreferencesManager(instance, singletonCImpl.providePreferencesManagerProvider.get());
      return instance;
    }

    private CliplockerTileService injectCliplockerTileService2(CliplockerTileService instance) {
      CliplockerTileService_MembersInjector.injectClipRepository(instance, singletonCImpl.provideClipRepositoryProvider.get());
      return instance;
    }
  }

  private static final class SingletonCImpl extends CliplockerApp_HiltComponents.SingletonC {
    private final ApplicationContextModule applicationContextModule;

    private final SingletonCImpl singletonCImpl = this;

    private Provider<DatabaseKeyManager> provideDatabaseKeyManagerProvider;

    private Provider<AppDatabase> provideAppDatabaseProvider;

    private Provider<PreferencesManager> providePreferencesManagerProvider;

    private Provider<ImageStorageManager> provideImageStorageManagerProvider;

    private Provider<ClipRepository> provideClipRepositoryProvider;

    private Provider<ExpiryWorker_AssistedFactory> expiryWorker_AssistedFactoryProvider;

    private Provider<RetentionWorker_AssistedFactory> retentionWorker_AssistedFactoryProvider;

    private SingletonCImpl(ApplicationContextModule applicationContextModuleParam) {
      this.applicationContextModule = applicationContextModuleParam;
      initialize(applicationContextModuleParam);

    }

    private ClipDao clipDao() {
      return DatabaseModule_ProvideClipDaoFactory.provideClipDao(provideAppDatabaseProvider.get());
    }

    private IgnoreAppDao ignoreAppDao() {
      return DatabaseModule_ProvideIgnoreAppDaoFactory.provideIgnoreAppDao(provideAppDatabaseProvider.get());
    }

    private Map<String, javax.inject.Provider<WorkerAssistedFactory<? extends ListenableWorker>>> mapOfStringAndProviderOfWorkerAssistedFactoryOf(
        ) {
      return MapBuilder.<String, javax.inject.Provider<WorkerAssistedFactory<? extends ListenableWorker>>>newMapBuilder(2).put("com.cliplocker.app.worker.ExpiryWorker", ((Provider) expiryWorker_AssistedFactoryProvider)).put("com.cliplocker.app.worker.RetentionWorker", ((Provider) retentionWorker_AssistedFactoryProvider)).build();
    }

    private HiltWorkerFactory hiltWorkerFactory() {
      return WorkerFactoryModule_ProvideFactoryFactory.provideFactory(mapOfStringAndProviderOfWorkerAssistedFactoryOf());
    }

    @SuppressWarnings("unchecked")
    private void initialize(final ApplicationContextModule applicationContextModuleParam) {
      this.provideDatabaseKeyManagerProvider = DoubleCheck.provider(new SwitchingProvider<DatabaseKeyManager>(singletonCImpl, 3));
      this.provideAppDatabaseProvider = DoubleCheck.provider(new SwitchingProvider<AppDatabase>(singletonCImpl, 2));
      this.providePreferencesManagerProvider = DoubleCheck.provider(new SwitchingProvider<PreferencesManager>(singletonCImpl, 4));
      this.provideImageStorageManagerProvider = DoubleCheck.provider(new SwitchingProvider<ImageStorageManager>(singletonCImpl, 5));
      this.provideClipRepositoryProvider = DoubleCheck.provider(new SwitchingProvider<ClipRepository>(singletonCImpl, 1));
      this.expiryWorker_AssistedFactoryProvider = SingleCheck.provider(new SwitchingProvider<ExpiryWorker_AssistedFactory>(singletonCImpl, 0));
      this.retentionWorker_AssistedFactoryProvider = SingleCheck.provider(new SwitchingProvider<RetentionWorker_AssistedFactory>(singletonCImpl, 6));
    }

    @Override
    public void injectCliplockerApp(CliplockerApp cliplockerApp) {
      injectCliplockerApp2(cliplockerApp);
    }

    @Override
    public void injectBootReceiver(BootReceiver bootReceiver) {
      injectBootReceiver2(bootReceiver);
    }

    @Override
    public void injectScreenStateReceiver(ScreenStateReceiver screenStateReceiver) {
      injectScreenStateReceiver2(screenStateReceiver);
    }

    @Override
    public Set<Boolean> getDisableFragmentGetContextFix() {
      return Collections.<Boolean>emptySet();
    }

    @Override
    public ActivityRetainedComponentBuilder retainedComponentBuilder() {
      return new ActivityRetainedCBuilder(singletonCImpl);
    }

    @Override
    public ServiceComponentBuilder serviceComponentBuilder() {
      return new ServiceCBuilder(singletonCImpl);
    }

    private CliplockerApp injectCliplockerApp2(CliplockerApp instance) {
      CliplockerApp_MembersInjector.injectWorkerFactory(instance, hiltWorkerFactory());
      CliplockerApp_MembersInjector.injectPreferencesManager(instance, providePreferencesManagerProvider.get());
      return instance;
    }

    private BootReceiver injectBootReceiver2(BootReceiver instance) {
      BootReceiver_MembersInjector.injectPreferencesManager(instance, providePreferencesManagerProvider.get());
      return instance;
    }

    private ScreenStateReceiver injectScreenStateReceiver2(ScreenStateReceiver instance) {
      ScreenStateReceiver_MembersInjector.injectPreferencesManager(instance, providePreferencesManagerProvider.get());
      return instance;
    }

    private static final class SwitchingProvider<T> implements Provider<T> {
      private final SingletonCImpl singletonCImpl;

      private final int id;

      SwitchingProvider(SingletonCImpl singletonCImpl, int id) {
        this.singletonCImpl = singletonCImpl;
        this.id = id;
      }

      @SuppressWarnings("unchecked")
      @Override
      public T get() {
        switch (id) {
          case 0: // com.cliplocker.app.worker.ExpiryWorker_AssistedFactory 
          return (T) new ExpiryWorker_AssistedFactory() {
            @Override
            public ExpiryWorker create(Context context, WorkerParameters params) {
              return new ExpiryWorker(context, params, singletonCImpl.provideClipRepositoryProvider.get(), singletonCImpl.providePreferencesManagerProvider.get());
            }
          };

          case 1: // com.cliplocker.app.data.repository.ClipRepository 
          return (T) RepositoryModule_ProvideClipRepositoryFactory.provideClipRepository(ApplicationContextModule_ProvideContextFactory.provideContext(singletonCImpl.applicationContextModule), singletonCImpl.clipDao(), singletonCImpl.ignoreAppDao(), singletonCImpl.providePreferencesManagerProvider.get(), singletonCImpl.provideImageStorageManagerProvider.get());

          case 2: // com.cliplocker.app.data.local.AppDatabase 
          return (T) DatabaseModule_ProvideAppDatabaseFactory.provideAppDatabase(ApplicationContextModule_ProvideContextFactory.provideContext(singletonCImpl.applicationContextModule), singletonCImpl.provideDatabaseKeyManagerProvider.get());

          case 3: // com.cliplocker.app.core.crypto.DatabaseKeyManager 
          return (T) DatabaseModule_ProvideDatabaseKeyManagerFactory.provideDatabaseKeyManager(ApplicationContextModule_ProvideContextFactory.provideContext(singletonCImpl.applicationContextModule));

          case 4: // com.cliplocker.app.data.preferences.PreferencesManager 
          return (T) RepositoryModule_ProvidePreferencesManagerFactory.providePreferencesManager(ApplicationContextModule_ProvideContextFactory.provideContext(singletonCImpl.applicationContextModule));

          case 5: // com.cliplocker.app.data.storage.ImageStorageManager 
          return (T) DatabaseModule_ProvideImageStorageManagerFactory.provideImageStorageManager(ApplicationContextModule_ProvideContextFactory.provideContext(singletonCImpl.applicationContextModule));

          case 6: // com.cliplocker.app.worker.RetentionWorker_AssistedFactory 
          return (T) new RetentionWorker_AssistedFactory() {
            @Override
            public RetentionWorker create(Context context2, WorkerParameters params2) {
              return new RetentionWorker(context2, params2, singletonCImpl.provideClipRepositoryProvider.get(), singletonCImpl.providePreferencesManagerProvider.get());
            }
          };

          default: throw new AssertionError(id);
        }
      }
    }
  }
}
