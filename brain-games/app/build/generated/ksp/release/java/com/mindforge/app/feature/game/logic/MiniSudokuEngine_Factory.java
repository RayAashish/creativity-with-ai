package com.mindforge.app.feature.game.logic;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;

@ScopeMetadata("javax.inject.Singleton")
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
public final class MiniSudokuEngine_Factory implements Factory<MiniSudokuEngine> {
  @Override
  public MiniSudokuEngine get() {
    return newInstance();
  }

  public static MiniSudokuEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static MiniSudokuEngine newInstance() {
    return new MiniSudokuEngine();
  }

  private static final class InstanceHolder {
    private static final MiniSudokuEngine_Factory INSTANCE = new MiniSudokuEngine_Factory();
  }
}
