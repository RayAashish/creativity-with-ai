package com.cliplocker.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface IgnoreAppDao {

    @Query("SELECT * FROM ignored_apps ORDER BY app_label ASC")
    fun getAllIgnoredApps(): Flow<List<IgnoreAppEntity>>

    @Query("SELECT EXISTS(SELECT 1 FROM ignored_apps WHERE package_name = :packageName)")
    suspend fun isIgnored(packageName: String): Boolean

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIgnoredApp(app: IgnoreAppEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertIgnoredApps(apps: List<IgnoreAppEntity>)

    @Query("DELETE FROM ignored_apps WHERE package_name = :packageName")
    suspend fun deleteIgnoredApp(packageName: String)
}
