type SectionScrollRoot = Pick<ParentNode, 'querySelector'>
type SectionDocumentRoot = Pick<Document, 'getElementById'>

/**
 * Resolve a property section inside the scroll container that owns the nav.
 *
 * The desktop detail route renders a hidden mobile copy alongside the modal,
 * so document.getElementById() can return the hidden section first. Scoping the
 * lookup keeps modal navigation attached to the visible panel.
 */
export function findPropertySection(
  id: string,
  scrollRoot?: SectionScrollRoot | null,
  documentRoot: SectionDocumentRoot = document,
): HTMLElement | null {
  return scrollRoot?.querySelector<HTMLElement>(`[id="${id}"]`)
    ?? documentRoot.getElementById(id)
}
