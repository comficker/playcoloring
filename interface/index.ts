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

export interface Tax {
  "id" : number
  "id_string" : string
  "name" : string
  "title" : string
  "desc" : string
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
  taxonomies: Tax[]
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
  username: string,
  meta: {
    coloring: {
      current: string
    }
  }
}

export interface Workspace {
  id: number
  name: string
  desc: string
  id_string: string
  width: number
  height: number
  colors: string[]
  map_numbers: {[key: string]: number}
  results: {[key: string]: number}
  steps: Step[]
  template?: number | undefined
  taxonomies?: Tax[]
}

export interface SaveForm {
  as_template: boolean
  tags: string[]
  name: string
  desc: string
}

export interface IBreadcrumb {
  name: string
  icon?: string | null
  to: string
}
