import { test, expect } from '@playwright/test'

test('homepage loads and shows hero section', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#home')).toBeVisible()
  await expect(page.locator('h1')).toBeVisible()
})

test('navigation links work', async ({ page }) => {
  await page.goto('/')
  const nav = page.locator('header nav')
  await expect(nav.locator('a[href="#about"]')).toBeVisible()
  await expect(nav.locator('a[href="#skills"]')).toBeVisible()
  await expect(nav.locator('a[href="#projects"]')).toBeVisible()
})

test('theme toggle works', async ({ page }) => {
  await page.goto('/')
  const toggle = page.locator('button[aria-label*="Switch to"]').first()
  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('contact form is visible', async ({ page }) => {
  await page.goto('/')
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expect(page.locator('#contact')).toBeVisible()
})