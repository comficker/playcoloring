export interface Links {
  next: string
  previous: any
}

export interface Sizes {
  thumb_24: string
  thumb_256: string
}

export interface TagMetaSchema {

}

export interface PostMetaSchema {

}

export interface TagSchema {
  id: number
  updated: string
  created: string
  db_status: number
  name: string
  id_string: string
  title: string
  desc: string
  meta: TagMetaSchema
  type: string
  path: string
}

export interface Step {
  t: string,
  c?: number,
  k?: string,
  v?: any
}

export interface SharedPage {
  id: number
  width: number
  height: number
  updated: string
  created: string
  db_status: number
  is_template: boolean
  name: string
  id_string: string
  desc: any
  meta: any
  colors: any[]
  map_numbers: {[key: string]: number}
  steps: Step[]

  user: any
  template?: number
  taxonomies: any[]
}

export interface ResponseTagSchema {
  instance: any
  properties: any[]
  links: Links
  count: number
  page_size: number
  num_pages: number
  results: TagSchema[]
}

export interface ResponseSharedPage {
  instance: any
  properties: any[]
  links: Links
  count: number
  page_size: number
  num_pages: number
  results: SharedPage[]
}

export interface User {
  id: number
  first_name: string
  last_name: string
  username: string
}

export interface Workspace {
  id: number
  width: number
  height: number
  colors: string[]
  map_numbers: {[key: string]: number}
  results: {[key: string]: number}
  steps: Step[]
  template?: number | undefined
}

export interface IBreadcrumb {
  name: string
  icon?: string | null
  to: string
}
