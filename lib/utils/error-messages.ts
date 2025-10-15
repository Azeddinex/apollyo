export const ErrorMessages = {
  NETWORK_ERROR: {
    title: 'خطأ في الاتصال',
    titleEn: 'Connection Error',
    message: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
    messageEn: 'Unable to connect to the server. Please check your internet connection and try again.',
    action: 'إعادة المحاولة',
    actionEn: 'Retry'
  },
  TIMEOUT_ERROR: {
    title: 'انتهت مهلة الطلب',
    titleEn: 'Request Timeout',
    message: 'استغرق البحث وقتًا طويلاً. حاول تقليل عمق البحث أو عدد النتائج.',
    messageEn: 'The search took too long. Try reducing the depth or max results.',
    action: 'تعديل الإعدادات',
    actionEn: 'Adjust Settings'
  },
  VALIDATION_ERROR: {
    title: 'خطأ في البيانات المدخلة',
    titleEn: 'Validation Error',
    message: 'يرجى التحقق من صحة البيانات المدخلة والمحاولة مرة أخرى.',
    messageEn: 'Please check your input data and try again.',
    action: 'تصحيح البيانات',
    actionEn: 'Fix Input'
  },
  NO_RESULTS: {
    title: 'لم يتم العثور على نتائج',
    titleEn: 'No Results Found',
    message: 'لم نتمكن من العثور على كلمات تطابق معاييرك. حاول تعديل الفلاتر.',
    messageEn: 'We could not find words matching your criteria. Try adjusting the filters.',
    action: 'تعديل الفلاتر',
    actionEn: 'Adjust Filters'
  },
  SERVER_ERROR: {
    title: 'خطأ في الخادم',
    titleEn: 'Server Error',
    message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.',
    messageEn: 'An unexpected error occurred. Please try again later.',
    action: 'المحاولة لاحقًا',
    actionEn: 'Try Later'
  },
  RATE_LIMIT_ERROR: {
    title: 'تجاوز الحد المسموح',
    titleEn: 'Rate Limit Exceeded',
    message: 'لقد تجاوزت الحد المسموح من الطلبات. يرجى الانتظار قليلاً.',
    messageEn: 'You have exceeded the allowed number of requests. Please wait a moment.',
    action: 'الانتظار',
    actionEn: 'Wait'
  }
}

export function getErrorMessage(error: any): typeof ErrorMessages[keyof typeof ErrorMessages] {
  if (error.message?.includes('timeout')) {
    return ErrorMessages.TIMEOUT_ERROR
  }
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return ErrorMessages.NETWORK_ERROR
  }
  if (error.message?.includes('validation')) {
    return ErrorMessages.VALIDATION_ERROR
  }
  if (error.status === 429 || error.message?.includes('rate limit')) {
    return ErrorMessages.RATE_LIMIT_ERROR
  }
  return ErrorMessages.SERVER_ERROR
}