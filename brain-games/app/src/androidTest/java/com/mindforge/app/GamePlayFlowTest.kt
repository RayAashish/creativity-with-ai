package com.mindforge.app

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class GamePlayFlowTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun testLaunchGame_InstructionsAndPlayScreensRenderProperly() {
        // Wait for MainActivity home screen to settle
        composeTestRule.waitForIdle()

        // Scroll to Quick Calc card on Home Screen and click it
        val quickCalcNode = composeTestRule.onNodeWithText("Quick Calc")
        quickCalcNode.performScrollTo().assertIsDisplayed()
        quickCalcNode.performClick()

        // Wait for instructions screen
        composeTestRule.waitForIdle()

        // Verify instructions screen has loaded (Title, Rules, Start Level button)
        composeTestRule.onNodeWithText("Rules of the Round").assertIsDisplayed()

        // Scroll to "Start Level" and click it
        val startButton = composeTestRule.onNodeWithText("Start Level", substring = true)
        startButton.performScrollTo().assertIsDisplayed()
        startButton.performClick()

        // Wait for gameplay screen
        composeTestRule.waitForIdle()

        // Verify gameplay screen elements: "0 pts" or score indicator and Question counter
        composeTestRule.onNodeWithText("0 pts").assertIsDisplayed()
        composeTestRule.onNodeWithText("Q 1", substring = true).assertIsDisplayed()
    }
}
