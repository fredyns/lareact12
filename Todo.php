<?php
/**
 * Todo:
 *  25. @ edit-modal for sub-item: show dialog title persistently, without shimmering effect.
 *  28. @ edit-modal for sub-item: pass only `subItem` object instead of `id`. use optimistic to edit fields.
 *  29. @ show item page: create card on top for fields: string, integer, text. convert other cards as tabs.
 *  30. @ form-fields for items: follow show item layout for placing fields.
 *  31. create table `sample_tree_nodes` as sample for node tree/nested set application. this table belong to `sample_items`. fields are: id, item_id, parent_id, title, user_id, description & nested set attributes. implement `lazychaser/laravel-nestedset`.
 *  32. create index section for `sample_tree_nodes` placed in show item page. organize rows as hierarchy.
 *  33. create 'create-modal' for `sample_tree_nodes` placed in show item page.
 *  34. create 'show-modal' for `sample_tree_nodes` placed in show item page.
 *  35. create 'edit-modal' for `sample_tree_nodes` placed in show item page.
 *  36. sorting `sample_tree_nodes` function in index section with drag & drop.
 *  37.
 * 
 */ 