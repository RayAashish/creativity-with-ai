package org.ledger.pdf.data.db

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [RecentDocumentEntity::class],
    version = 1,
    exportSchema = false
)
abstract class LedgerDatabase : RoomDatabase() {
    abstract fun recentDocumentDao(): RecentDocumentDao
}
