import socialShareClient from "~/plugins/socialShare.client";

export interface Links {
  next: string
  previous: string
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
  type: string,
  value: any,
  t?: string,
  v?: any,
  k?: string,
  c?: number,
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
  updated?: string
  created?: string
  db_status: number
  is_template: boolean
  name: string
  id_string: string
  new_id_string?: string,
  desc: any
  meta: any
  colors: any[]
  map_numbers: {[key: string]: number}
  steps: Step[]
  status: string

  user: User | null
  template?: number | null
  taxonomies: Tax[]

  tags?: string[]
  results?: {[key: string]: number}
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
      current?: string,
      editor?: string
    }
  }
}

export interface SaveForm {
  is_template: boolean
  tags: string[]
  name: string
  desc: string
  status: string
  new_id_string: string
}

export interface IBreadcrumb {
  name: string
  icon?: string | null
  to: string
}


export interface Options {
  color: number,
  pointer: string,
  zoom: number,
  isMoving: boolean,
  isPainting: boolean,
  paletteFunc: string,
  boardFunc: string,
}
