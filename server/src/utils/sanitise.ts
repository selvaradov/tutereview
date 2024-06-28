function escapeRegex(text: string): RegExp {
  return new RegExp(text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
}

export { escapeRegex }