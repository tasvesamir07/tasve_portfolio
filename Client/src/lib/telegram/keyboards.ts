import { InlineKeyboard, Keyboard } from 'grammy'

export function requestPhoneKB() {
  return new Keyboard()
    .requestContact('📞 Share Phone Number to Verify')
    .resized()
    .oneTime()
}

export function mainMenuKB() {
  return new Keyboard()
    .text('👤 Profile').text('📝 Blogs').text('🖥️ Projects').row()
    .text('📊 Skills').text('🖼️ Gallery').text('🏅 Certs').row()
    .text('💼 Exp').text('🎓 Edu').text('📬 Messages').row()
    .resized()
}

export function confirmKB(prefix: string, id?: string | number): InlineKeyboard {
  const suffix = id !== undefined ? `_${id}` : ''
  return new InlineKeyboard()
    .text('✅ Yes', `${prefix}_yes${suffix}`)
    .text('❌ No', `${prefix}_no${suffix}`)
}

export function cancelKB(): InlineKeyboard {
  return new InlineKeyboard().text('❌ Cancel', 'cancel')
}

export function entityListKB(
  items: { id: number | string; label: string }[],
  prefix: string
): InlineKeyboard {
  const keyboard = new InlineKeyboard()
  items.forEach((item) => {
    keyboard.text(item.label, `${prefix}_select_${item.id}`).row()
  })
  keyboard.text('❌ Cancel', 'cancel')
  return keyboard
}

export function profileFieldKB(): InlineKeyboard {
  return new InlineKeyboard()
    .text('Name', 'profile_field_name')
    .text('Title', 'profile_field_title').row()
    .text('Intro', 'profile_field_intro')
    .text('Description', 'profile_field_description').row()
    .text('Email', 'profile_field_email')
    .text('Location', 'profile_field_location').row()
    .text('GitHub', 'profile_field_github')
    .text('LinkedIn', 'profile_field_linkedin').row()
    .text('Twitter', 'profile_field_twitter')
    .text('CodePen', 'profile_field_codepen').row()
    .text('Passion', 'profile_field_passion')
    .text('Resume URL', 'profile_field_resume_url').row()
    .text('❌ Cancel', 'cancel')
}

export function blogFieldKB(id: string | number): InlineKeyboard {
  return new InlineKeyboard()
    .text('Title', `blog_field_title_${id}`)
    .text('Slug', `blog_field_slug_${id}`).row()
    .text('Excerpt', `blog_field_excerpt_${id}`)
    .text('Content', `blog_field_content_${id}`).row()
    .text('Tags', `blog_field_tags_${id}`)
    .text('Cover Image', `blog_field_cover_image_${id}`).row()
    .text('❌ Cancel', 'cancel')
}

export function projectFieldKB(id: string | number): InlineKeyboard {
  return new InlineKeyboard()
    .text('Title', `project_field_title_${id}`)
    .text('Category', `project_field_category_${id}`).row()
    .text('Tag', `project_field_tag_${id}`)
    .text('Description', `project_field_desc_${id}`).row()
    .text('Tags (Stack)', `project_field_tags_${id}`)
    .text('GitHub URL', `project_field_github_${id}`).row()
    .text('Live URL', `project_field_live_${id}`)
    .text('Image URL', `project_field_image_${id}`).row()
    .text('❌ Cancel', 'cancel')
}

export function educationTypeKB(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🎓 Education', 'edu_type_education')
    .text('🏅 Award', 'edu_type_award').row()
    .text('📢 Activity', 'edu_type_activity').row()
    .text('❌ Cancel', 'cancel')
}

export function genericFieldKB(prefix: string, id: string | number, fields: string[]): InlineKeyboard {
  const keyboard = new InlineKeyboard()
  for (let i = 0; i < fields.length; i += 2) {
    const f1 = fields[i]
    const f2 = fields[i + 1]
    keyboard.text(f1, `${prefix}_field_${f1}_${id}`)
    if (f2) {
      keyboard.text(f2, `${prefix}_field_${f2}_${id}`)
    }
    keyboard.row()
  }
  keyboard.text('❌ Cancel', 'cancel')
  return keyboard
}
