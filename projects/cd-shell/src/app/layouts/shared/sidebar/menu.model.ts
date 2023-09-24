export interface MenuItem {
    id?: number; // menuId
    label?: string; // manuLabel
    icon?: string; // icon: https://remixicon.com/
    link?: string; // path
    subItems?: any; // children
    isTitle?: boolean; // isTitel
    badge?: any; // badge
    parentId?: number; // parentId
    isLayout?: boolean; // isLayout
    moduleIsPublic?: boolean // moduleIsPublic // to determine routes that need guarding
}

// export interface MenuItem {
//     menuId?: number; // menuId
//     manuLabel?: string; // manuLabel
//     icon?: string; // icon: https://remixicon.com/
//     path?: string; // path
//     children?: any; // children
//     isTitel?: boolean; // isTitel
//     badge?: any; // badge
//     parentId?: number; // parentId
//     isLayout?: boolean; // isLayout
//     moduleIsPublic?: boolean // moduleIsPublic // to determine routes that need guarding
// }
