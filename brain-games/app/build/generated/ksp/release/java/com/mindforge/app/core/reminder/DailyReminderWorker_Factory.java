package com.mindforge.app.core.reminder;

import android.content.Context;
import androidx.work.WorkerParameters;
import dagger.internal.DaggerGenerated;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;

@ScopeMetadata
@QualifierMetadata
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
public final class DailyReminderWorker_Factory {
  public DailyReminderWorker_Factory() {
  }

  public DailyReminderWorker get(Context appContext, WorkerParameters workerParams) {
    return newInstance(appContext, workerParams);
  }

  public static DailyReminderWorker_Factory create() {
    return new DailyReminderWorker_Factory();
  }

  public static DailyReminderWorker newInstance(Context appContext, WorkerParameters workerParams) {
    return new DailyReminderWorker(appContext, workerParams);
  }
}
